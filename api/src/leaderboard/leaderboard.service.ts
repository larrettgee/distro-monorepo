import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import {
  Submission,
  type SubmissionDocument,
} from '../submissions/schemas/submission.schema';
import { ClipperStatsDto } from './dto/clipper-stats.dto';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import type { ClipperAggregate, ClipperRanking } from './leaderboard.types';
import { assignRanks, roundUsdc } from './leaderboard.utils';

/** Raw row produced by the aggregation pipeline, before ranking. */
interface AggregateRow {
  privyId: string;
  username: string | null;
  walletAddress: string;
  totalViews: number;
  clipCount: number;
  rawEarningsUsdc: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  // ─── Queries ───

  async getLeaderboard(limit: number): Promise<LeaderboardEntryDto[]> {
    const rankings = await this.rankClippers();
    return rankings.slice(0, limit);
  }

  async getStatsForClipper(privyId: string): Promise<ClipperStatsDto> {
    const rankings = await this.rankClippers();
    const mine = rankings.find((row) => row.privyId === privyId);
    return {
      rank: mine?.rank ?? null,
      totalViews: mine?.totalViews ?? 0,
      clipCount: mine?.clipCount ?? 0,
      estimatedEarningsUsdc: mine?.estimatedEarningsUsdc ?? 0,
      totalClippers: rankings.length,
    };
  }

  // ─── Internal helpers ───

  /**
   * Aggregate every clipper's views and estimated earnings across all of their
   * non-rejected submissions, then sort and stamp ranks. Both endpoints derive
   * from this single pass so a clipper's `rank` stays consistent with the board.
   */
  private async rankClippers(): Promise<ClipperRanking[]> {
    const rows = await this.submissionModel.aggregate<AggregateRow>(
      this.rankingPipeline(),
    );
    const aggregates: ClipperAggregate[] = rows.map((row) => ({
      privyId: row.privyId,
      username: row.username,
      walletAddress: row.walletAddress,
      totalViews: row.totalViews,
      clipCount: row.clipCount,
      estimatedEarningsUsdc: roundUsdc(row.rawEarningsUsdc),
    }));
    return assignRanks(aggregates);
  }

  private rankingPipeline(): PipelineStage[] {
    return [
      { $match: { status: { $ne: 'rejected' } } },
      { $addFields: { views: { $ifNull: ['$lastViewCount', 0] } } },
      // Join each clip to its campaign's per-1k rate (campaignId is the _id string).
      {
        $lookup: {
          from: 'campaigns',
          let: { cid: '$campaignId' },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$cid'] } } },
            { $project: { ratePerThousandViews: 1 } },
          ],
          as: 'campaign',
        },
      },
      {
        $addFields: {
          rate: {
            $ifNull: [
              { $arrayElemAt: ['$campaign.ratePerThousandViews', 0] },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$clipperPrivyId',
          walletAddress: { $first: '$clipperWallet' },
          totalViews: { $sum: '$views' },
          clipCount: { $sum: 1 },
          rawEarningsUsdc: {
            $sum: { $multiply: [{ $divide: ['$views', 1000] }, '$rate'] },
          },
        },
      },
      // Resolve the clipper's current public username.
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: 'privyId',
          as: 'account',
        },
      },
      {
        $project: {
          _id: 0,
          privyId: '$_id',
          username: { $arrayElemAt: ['$account.username', 0] },
          walletAddress: 1,
          totalViews: 1,
          clipCount: 1,
          rawEarningsUsdc: 1,
        },
      },
    ];
  }
}
