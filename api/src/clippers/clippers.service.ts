import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { YoutubeService } from '../youtube/youtube.service';
import { bioContainsCode, generateConnectCode } from './clippers.utils';
import { ClipperProfileResponseDto } from './dto/clipper-profile-response.dto';
import { StartConnectResponseDto } from './dto/clipper-profile-response.dto';
import {
  ClipperProfile,
  type ClipperProfileDocument,
} from './schemas/clipper-profile.schema';

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
    await this.youtubeService.getChannelInfo(channelUrl);

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
      youtubeChannelId: channel.channelId,
      privyId: { $ne: privyId },
    });
    if (taken) {
      throw new ConflictException(
        'This YouTube channel is already connected to another account.',
      );
    }

    profile.youtubeChannelId = channel.channelId;
    profile.youtubeHandle = channel.customUrl ?? undefined;
    profile.connectedAt = new Date();
    profile.pendingCode = undefined;
    profile.pendingChannelRef = undefined;
    await profile.save();
    return this.toResponse(profile);
  }

  // ─── Queries ───

  async getMe(privyId: string): Promise<ClipperProfileResponseDto> {
    const profile = await this.profileModel.findOne({ privyId }).exec();
    if (!profile) {
      return {
        connected: false,
        youtubeChannelId: null,
        youtubeHandle: null,
        pendingCode: null,
      };
    }
    return this.toResponse(profile);
  }

  /** Used by submissions to validate that a clip belongs to the clipper. */
  async getConnectedChannelId(privyId: string): Promise<string | null> {
    const profile = await this.profileModel
      .findOne({ privyId }, { youtubeChannelId: 1 })
      .lean()
      .exec();
    return profile?.youtubeChannelId ?? null;
  }

  // ─── Internal helpers ───

  private toResponse(
    profile: ClipperProfileDocument,
  ): ClipperProfileResponseDto {
    return {
      connected: Boolean(profile.youtubeChannelId),
      youtubeChannelId: profile.youtubeChannelId ?? null,
      youtubeHandle: profile.youtubeHandle ?? null,
      pendingCode: profile.pendingCode ?? null,
    };
  }
}
