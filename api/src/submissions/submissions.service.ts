import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CampaignsService } from '../campaigns/campaigns.service';
import { ClippersService } from '../clippers/clippers.service';
import { YoutubeService } from '../youtube/youtube.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import {
  CreateSubmissionsResultDto,
  RejectedSubmissionDto,
  SubmissionResponseDto,
} from './dto/submission-response.dto';
import {
  Submission,
  type SubmissionDocument,
} from './schemas/submission.schema';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly campaignsService: CampaignsService,
    private readonly clippersService: ClippersService,
    private readonly youtubeService: YoutubeService,
  ) {}

  // ─── Mutations ───

  async submit(
    user: AuthenticatedUser,
    campaignId: string,
    dto: CreateSubmissionDto,
  ): Promise<CreateSubmissionsResultDto> {
    if (!user.account) {
      throw new ForbiddenException('Account is not registered.');
    }

    const campaign = await this.campaignsService.findById(campaignId);
    if (campaign.status !== 'active') {
      throw new BadRequestException('Campaign is not accepting submissions.');
    }

    const channelIds = await this.clippersService.getConnectedChannelIds(
      user.privyId,
    );
    if (channelIds.length === 0) {
      throw new BadRequestException(
        'Connect and verify a YouTube channel before submitting.',
      );
    }

    const accepted: SubmissionResponseDto[] = [];
    const rejected: RejectedSubmissionDto[] = [];

    for (const url of dto.videoUrls) {
      try {
        accepted.push(
          await this.validateAndCreate(
            user,
            campaignId,
            channelIds,
            url,
          ),
        );
      } catch (error) {
        rejected.push({
          url,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { accepted, rejected };
  }

  // ─── Queries ───

  async listForCampaign(
    user: AuthenticatedUser,
    campaignId: string,
  ): Promise<SubmissionResponseDto[]> {
    const campaign = await this.campaignsService.findById(campaignId);
    const isOwner = campaign.brandPrivyId === user.privyId;
    const filter = isOwner
      ? { campaignId }
      : { campaignId, clipperPrivyId: user.privyId };

    const submissions = await this.submissionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
    return submissions.map((s) => this.toResponse(s));
  }

  // ─── Internal helpers ───

  private async validateAndCreate(
    user: AuthenticatedUser,
    campaignId: string,
    channelIds: string[],
    url: string,
  ): Promise<SubmissionResponseDto> {
    const video = await this.youtubeService.getVideoInfo(url);
    if (!channelIds.includes(video.channel.channelId)) {
      throw new BadRequestException(
        'Video is not published by one of your connected channels.',
      );
    }

    const duplicate = await this.submissionModel.exists({
      campaignId,
      videoId: video.videoId,
    });
    if (duplicate) {
      throw new BadRequestException(
        'This video has already been submitted to the campaign.',
      );
    }

    const created = await this.submissionModel.create({
      campaignId,
      clipperPrivyId: user.privyId,
      clipperWallet: user.account!.walletAddress,
      videoId: video.videoId,
      videoUrl: url,
      channelId: video.channel.channelId,
      status: 'pending',
      lastViewCount: video.viewCount ?? undefined,
    });
    return this.toResponse(created);
  }

  private toResponse(s: SubmissionDocument): SubmissionResponseDto {
    return {
      id: s.id,
      campaignId: s.campaignId,
      videoId: s.videoId,
      videoUrl: s.videoUrl,
      channelId: s.channelId,
      status: s.status,
      lastViewCount: s.lastViewCount ?? null,
      createdAt: (s.get('createdAt') as Date).toISOString(),
    };
  }
}
