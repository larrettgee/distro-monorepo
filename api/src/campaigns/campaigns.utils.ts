import { formatUnits, parseUnits } from 'viem';

/** Convert a human USDC amount to integer base units (e.g. 10.5 @ 6 → 10500000n). */
export function toBaseUnits(amount: number, decimals: number): bigint {
  return parseUnits(amount.toString(), decimals);
}

/** Convert integer base units back to a human amount (e.g. 10500000n @ 6 → 10.5). */
export function toDisplayUnits(amount: bigint, decimals: number): number {
  return Number(formatUnits(amount, decimals));
}
