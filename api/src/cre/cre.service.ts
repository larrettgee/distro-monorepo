import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignsService } from '../campaigns/campaigns.service';
import type { CampaignDocument } from '../campaigns/schemas/campaign.schema';
import type { AppConfig } from '../config/configuration';
import {
  Submission,
  type SubmissionDocument,
} from '../submissions/schemas/submission.schema';
import { YoutubeService } from '../youtube/youtube.service';
import { PAYABLE_SUBMISSION_STATUSES } from './cre.constants';
import type { DailyBatchPayload, JobBatch } from './cre.types';
import { aggregateByWallet, utcDateKey } from './cre.utils';
import { DailyBatch, type DailyBatchDocument } from './schemas/daily-batch.schema';

@Injectable()
export class CreService {
  private readonly logger = new Logger(CreService.name);

  constructor(
    @InjectModel(DailyBatch.name)
    private readonly batchModel: Model<DailyBatchDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly campaignsService: CampaignsService,
    private readonly youtubeService: YoutubeService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // ─── Queries ───

  /**
   * Returns today's payout batch, computing and persisting it on first request
   * of the UTC day so repeated calls (e.g. from each DON node) are identical.
   */
  async getDailyBatch(): Promise<DailyBatchPayload> {
    const dateKey = utcDateKey(new Date());

    const existing = await this.batchModel.findOne({ dateKey }).exec();
    if (existing) {
      return existing.payload;
    }

    const payload = await this.buildSnapshot(dateKey);
    try {
      await this.batchModel.create({ dateKey, payload });
    } catch {
      // Concurrent first-call race: another request persisted it; reuse that.
      const persisted = await this.batchModel.findOne({ dateKey }).exec();
      if (persisted) {
        return persisted.payload;
      }
    }
    return payload;
  }

  // ─── Internal helpers ───

  private async buildSnapshot(dateKey: string): Promise<DailyBatchPayload> {
    const chainId = this.config.get('chain.id', { infer: true });
    const campaigns = await this.campaignsService.findActiveOnchainDocs();

    const jobs: JobBatch[] = [];
    for (const campaign of campaigns) {
      jobs.push(await this.aggregateCampaign(campaign));
    }

    this.logger.log(
      `Built CRE batch ${dateKey}: ${jobs.length} job(s), ` +
        `${jobs.reduce((n, j) => n + j.recipients.length, 0)} recipient(s).`,
    );

    return {
      dateKey,
      chainId,
      generatedAt: new Date().toISOString(),
      jobs,
    };
  }

  /** Refresh view counts for a campaign's payable clips and aggregate per wallet. */
  private async aggregateCampaign(
    campaign: CampaignDocument,
  ): Promise<JobBatch> {
    const submissions = await this.submissionModel
      .find({
        campaignId: campaign.id,
        status: { $in: PAYABLE_SUBMISSION_STATUSES },
      })
      .exec();

    const entries: Array<{ wallet: string; views: number }> = [];
    for (const submission of submissions) {
      const views = await this.refreshViewCount(submission);
      entries.push({ wallet: submission.clipperWallet, views });
    }

    return {
      jobId: campaign.onchainJobId as number,
      reporterAddress: campaign.operatorAddress,
      recipients: aggregateByWallet(entries),
    };
  }

  /**
   * Best-effort refresh of a submission's view count from YouTube. On failure
   * the last stored count is used so a transient API error can't zero a payout.
   */
  private async refreshViewCount(
    submission: SubmissionDocument,
  ): Promise<number> {
    try {
      const video = await this.youtubeService.getVideoInfo(submission.videoUrl);
      if (video.viewCount !== null) {
        submission.lastViewCount = video.viewCount;
        await submission.save();
        return video.viewCount;
      }
    } catch (error) {
      this.logger.warn(
        `View refresh failed for submission ${submission.id}: ` +
          `${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
    return submission.lastViewCount ?? 0;
  }
}
