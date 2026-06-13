import type { ClipperAggregate, ClipperRanking } from './leaderboard.types';

/** Round a USDC amount to cents, avoiding floating-point noise. */
export function roundUsdc(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Gross estimated payout for a clip: views priced at the campaign's per-1k rate. */
export function estimateEarningsUsdc(
  views: number,
  ratePerThousandViews: number,
): number {
  return roundUsdc((views / 1000) * ratePerThousandViews);
}

/** Shorten a wallet for display when no username is available. */
export function shortenWallet(wallet: string): string {
  return wallet.length > 10
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : wallet;
}

/** Sort by views (desc) and stamp 1-based ranks, resolving a display name. */
export function assignRanks(rows: ClipperAggregate[]): ClipperRanking[] {
  return [...rows]
    .sort((a, b) => b.totalViews - a.totalViews)
    .map((row, index) => ({
      rank: index + 1,
      privyId: row.privyId,
      username: row.username ?? shortenWallet(row.walletAddress),
      walletAddress: row.walletAddress,
      totalViews: row.totalViews,
      clipCount: row.clipCount,
      estimatedEarningsUsdc: row.estimatedEarningsUsdc,
    }));
}
