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
import { CRE_BATCH_BUCKET_MS, PAYABLE_SUBMISSION_STATUSES } from './cre.constants';
import type { DailyBatchPayload, JobBatch } from './cre.types';
import { RefreshResultDto } from './dto/cre-batch-response.dto';
import { aggregateByWallet, bucketStartIso, utcDateKey } from './cre.utils';

@Injectable()
export class CreService {
  private readonly logger = new Logger(CreService.name);

  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly campaignsService: CampaignsService,
    private readonly youtubeService: YoutubeService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // ─── Queries ───

  /**
   * Build the current payout batch: each active on-chain campaign's clipper
   * wallets with their summed stored view counts.
   *
   * Pure function of stored DB state (no external calls), so it always reflects
   * current data and is byte-identical across concurrent DON-node calls within a
   * determinism bucket — required for the workflow's identical-consensus.
   * View-count freshness is a separate concern (see `refreshViews`).
   */
  async getBatch(): Promise<DailyBatchPayload> {
    const now = new Date();
    const chainId = this.config.get('chain.id', { infer: true });
    const campaigns = await this.campaignsService.findActiveOnchainDocs();

    const jobs: JobBatch[] = [];
    for (const campaign of campaigns) {
      jobs.push(await this.aggregateCampaign(campaign));
    }

    return {
      dateKey: utcDateKey(now),
      chainId,
      generatedAt: bucketStartIso(now, CRE_BATCH_BUCKET_MS),
      jobs,
    };
  }

  // ─── Mutations ───

  /**
   * Refresh stored view counts for active campaigns' payable submissions from
   * YouTube. Kept out of `getBatch` so the served batch stays deterministic;
   * call this (ops / scheduler) before settlement to make counts current.
   */
  async refreshViews(): Promise<RefreshResultDto> {
    const campaigns = await this.campaignsService.findActiveOnchainDocs();
    let refreshed = 0;
    let failed = 0;

    for (const campaign of campaigns) {
      const submissions = await this.payableSubmissions(campaign);
      for (const submission of submissions) {
        try {
          const video = await this.youtubeService.getVideoInfo(
            submission.videoUrl,
          );
          if (video.viewCount !== null) {
            submission.lastViewCount = video.viewCount;
            await submission.save();
            refreshed++;
          }
        } catch (error) {
          failed++;
          this.logger.warn(
            `View refresh failed for submission ${submission.id}: ` +
              `${error instanceof Error ? error.message : 'unknown'}`,
          );
        }
      }
    }

    this.logger.log(`Refreshed ${refreshed} submission(s), ${failed} failed.`);
    return { refreshed, failed };
  }

  // ─── Internal helpers ───

  private async aggregateCampaign(
    campaign: CampaignDocument,
  ): Promise<JobBatch> {
    const submissions = await this.payableSubmissions(campaign);
    const entries = submissions.map((s) => ({
      wallet: s.clipperWallet,
      views: s.lastViewCount ?? 0,
    }));

    return {
      jobId: campaign.onchainJobId as number,
      reporterAddress: campaign.operatorAddress,
      recipients: aggregateByWallet(entries),
    };
  }

  private payableSubmissions(
    campaign: CampaignDocument,
  ): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({
        campaignId: campaign.id,
        status: { $in: PAYABLE_SUBMISSION_STATUSES },
      })
      .exec();
  }
}
