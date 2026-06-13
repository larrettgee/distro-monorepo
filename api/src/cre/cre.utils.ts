import type { AggregatedRecipient } from './cre.types';

/** UTC day key (YYYY-MM-DD) used to make the daily batch idempotent. */
export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Sum view counts per wallet into deterministic, address-sorted recipients.
 * Cumulative-per-recipient matches `DistroEscrow.recordViews`, which credits
 * only the delta since the wallet's last recorded total.
 */
export function aggregateByWallet(
  entries: ReadonlyArray<{ wallet: string; views: number }>,
): AggregatedRecipient[] {
  const totals = new Map<string, number>();
  for (const { wallet, views } of entries) {
    totals.set(wallet, (totals.get(wallet) ?? 0) + views);
  }
  return [...totals.entries()]
    .map(([wallet, cumulativeViews]) => ({ wallet, cumulativeViews }))
    .sort((a, b) => (a.wallet < b.wallet ? -1 : a.wallet > b.wallet ? 1 : 0));
}
