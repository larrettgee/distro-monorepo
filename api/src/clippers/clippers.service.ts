import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { YoutubeService } from '../youtube/youtube.service';
import { bioContainsCode, generateConnectCode } from './clippers.utils';
import {
  ClipperProfileResponseDto,
  StartConnectResponseDto,
} from './dto/clipper-profile-response.dto';
import {
  ClipperProfile,
  type ClipperProfileDocument,
} from './schemas/clipper-profile.schema';

const YOUTUBE = 'youtube';

@Injectable()
export class ClippersService {
  constructor(
    @InjectModel(ClipperProfile.name)
    private readonly profileModel: Model<ClipperProfileDocument>,
    private readonly youtubeService: YoutubeService,
  ) {}

  // ─── Channel connection ───

  async startConnect(
    privyId: string,
    channelUrl: string,
  ): Promise<StartConnectResponseDto> {
    // Validate the channel exists before issuing a code.
    const channel = await this.youtubeService.getChannelInfo(channelUrl);

    // Don't hand out a code for a channel this clipper already connected.
    const existing = await this.profileModel.findOne({
      privyId,
      channels: { $elemMatch: { platform: YOUTUBE, channelId: channel.channelId } },
    });
    if (existing) {
      throw new ConflictException(
        'You have already connected this YouTube channel.',
      );
    }

    const code = generateConnectCode();
    await this.profileModel.updateOne(
      { privyId },
      { $set: { pendingCode: code, pendingChannelRef: channelUrl } },
      { upsert: true },
    );

    return {
      code,
      channelUrl,
      instructions: `Add "${code}" anywhere in your YouTube channel description, then call the verify endpoint. You can remove it afterwards.`,
    };
  }

  async verifyConnect(privyId: string): Promise<ClipperProfileResponseDto> {
    const profile = await this.profileModel.findOne({ privyId }).exec();
    if (profile) await this.migrateLegacy(profile);
    if (!profile?.pendingCode || !profile.pendingChannelRef) {
      throw new BadRequestException(
        'No pending channel connection. Call connect/start first.',
      );
    }

    const channel = await this.youtubeService.getChannelInfo(
      profile.pendingChannelRef,
    );
    if (!bioContainsCode(channel.description, profile.pendingCode)) {
      throw new BadRequestException(
        'Verification code was not found in the channel description.',
      );
    }

    // Prevent two clippers from claiming the same channel.
    const taken = await this.profileModel.findOne({
      privyId: { $ne: privyId },
      channels: { $elemMatch: { platform: YOUTUBE, channelId: channel.channelId } },
    });
    if (taken) {
      throw new ConflictException(
        'This YouTube channel is already connected to another account.',
      );
    }

    const already = profile.channels.some(
      (c) => c.platform === YOUTUBE && c.channelId === channel.channelId,
    );
    if (!already) {
      profile.channels.push({
        platform: YOUTUBE,
        channelId: channel.channelId,
        handle: channel.customUrl ?? undefined,
        title: channel.title,
        thumbnailUrl: channel.thumbnailUrl ?? undefined,
        connectedAt: new Date(),
      });
    }

    profile.pendingCode = undefined;
    profile.pendingChannelRef = undefined;
    await profile.save();
    return this.toResponse(profile);
  }

  async disconnectChannel(
    privyId: string,
    channelId: string,
  ): Promise<ClipperProfileResponseDto> {
    const profile = await this.profileModel.findOne({ privyId }).exec();
    if (profile) await this.migrateLegacy(profile);
    const before = profile?.channels.length ?? 0;
    if (!profile || before === 0) {
      throw new NotFoundException('No connected channels to remove.');
    }

    profile.channels = profile.channels.filter(
      (c) => c.channelId !== channelId,
    );
    if (profile.channels.length === before) {
      throw new NotFoundException('Channel is not connected to this account.');
    }

    await profile.save();
    return this.toResponse(profile);
  }

  // ─── Queries ───

  async getMe(privyId: string): Promise<ClipperProfileResponseDto> {
    const profile = await this.profileModel.findOne({ privyId }).exec();
    if (!profile) {
      return { connected: false, channels: [], pendingCode: null };
    }
    if (await this.migrateLegacy(profile)) await profile.save();
    return this.toResponse(profile);
  }

  /** Channel ids the clipper owns; used to validate submitted clips belong to them. */
  async getConnectedChannelIds(privyId: string): Promise<string[]> {
    const profile = await this.profileModel
      .findOne({ privyId }, { channels: 1, youtubeChannelId: 1 })
      .lean()
      .exec();
    const ids = (profile?.channels ?? [])
      .filter((c) => c.platform === YOUTUBE)
      .map((c) => c.channelId);
    // Fall back to a legacy single channel that hasn't been migrated yet.
    if (ids.length === 0 && profile?.youtubeChannelId) {
      ids.push(profile.youtubeChannelId);
    }
    return ids;
  }

  // ─── Internal helpers ───

  /**
   * Fold a pre-`channels[]` profile's single channel into the array, enriching
   * it with the channel's current title/avatar, then clear the legacy fields.
   * Returns true if the document was changed (caller saves). Best-effort: a
   * YouTube hiccup still migrates the channel, just without title/avatar.
   */
  private async migrateLegacy(
    profile: ClipperProfileDocument,
  ): Promise<boolean> {
    if (profile.channels.length > 0 || !profile.youtubeChannelId) return false;

    let handle = profile.youtubeHandle ?? undefined;
    let title: string | undefined;
    let thumbnailUrl: string | undefined;
    try {
      const info = await this.youtubeService.getChannelInfo(
        profile.youtubeChannelId,
      );
      title = info.title;
      thumbnailUrl = info.thumbnailUrl ?? undefined;
      handle = info.customUrl ?? handle;
    } catch {
      /* keep the legacy handle; enrich on a later request */
    }

    profile.channels.push({
      platform: YOUTUBE,
      channelId: profile.youtubeChannelId,
      handle,
      title,
      thumbnailUrl,
      connectedAt: profile.connectedAt ?? new Date(),
    });
    profile.youtubeChannelId = undefined;
    profile.youtubeHandle = undefined;
    profile.connectedAt = undefined;
    return true;
  }

  private toResponse(
    profile: ClipperProfileDocument,
  ): ClipperProfileResponseDto {
    return {
      connected: profile.channels.length > 0,
      channels: profile.channels.map((c) => ({
        platform: c.platform,
        channelId: c.channelId,
        handle: c.handle ?? null,
        title: c.title ?? null,
        thumbnailUrl: c.thumbnailUrl ?? null,
        connectedAt: (c.connectedAt ?? new Date()).toISOString(),
      })),
      pendingCode: profile.pendingCode ?? null,
    };
  }
}
