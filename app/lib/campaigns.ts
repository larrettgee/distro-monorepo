// UI view-model for campaign cards. Real data comes from the API and is mapped
// to this shape via lib/api/adapt.ts.

export type Platform = "X" | "TikTok" | "YouTube" | "Instagram" | "Reels";
export type Category =
  | "Sports"
  | "Music"
  | "Tech"
  | "Food"
  | "Entertainment"
  | "Beauty"
  | "Gaming";

export type Campaign = {
  id: string;
  brand: string;
  handle: string;
  title: string;
  category: Category;
  image: string;
  platforms: Platform[];
  /** USDC */
  rewardPool: number;
  paidOut: number;
  ratePer1k: number;
  /** short status/time label shown on the card */
  timeLeft: string;
  clippers: number;
  status: string;
};

export const usdc = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Compact USD, e.g. $59.6K. Computed manually rather than via `Intl` compact
 * notation, whose output differs between Node and browser ICU and would cause
 * hydration mismatches.
 */
export const usdcCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `$${n}`;
};
