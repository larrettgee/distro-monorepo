/** One clipper's aggregated performance, before a rank is assigned. */
export interface ClipperAggregate {
  privyId: string;
  /** Null when the submitting account can no longer be resolved. */
  username: string | null;
  walletAddress: string;
  totalViews: number;
  clipCount: number;
  estimatedEarningsUsdc: number;
}

/** A clipper's aggregate stamped with its 1-based leaderboard position. */
export interface ClipperRanking {
  rank: number;
  privyId: string;
  username: string;
  walletAddress: string;
  totalViews: number;
  clipCount: number;
  estimatedEarningsUsdc: number;
}
