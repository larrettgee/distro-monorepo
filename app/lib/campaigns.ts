export type Platform = "X" | "TikTok" | "YouTube" | "Farcaster" | "Instagram";

export type Campaign = {
  id: string;
  project: string;
  /** single-letter avatar + accent color */
  accent: string;
  tagline: string;
  platforms: Platform[];
  /** USDC */
  rewardPool: number;
  paidOut: number;
  /** USDC per 1,000 verified views */
  ratePer1k: number;
  minViews: number;
  clippers: number;
  tags: string[];
};

/** Mock marketplace data — replace with on-chain / API reads later. */
export const campaigns: Campaign[] = [
  {
    id: "hyperliquid-perp-szn",
    project: "Hyperliquid",
    accent: "#59e6a8",
    tagline: "Clip the best perp trades from our live streams.",
    platforms: ["X", "YouTube", "TikTok"],
    rewardPool: 12000,
    paidOut: 4120,
    ratePer1k: 2.5,
    minViews: 5000,
    clippers: 218,
    tags: ["DeFi", "Trading"],
  },
  {
    id: "monad-testnet-hype",
    project: "Monad",
    accent: "#8ef5c6",
    tagline: "Make the testnet launch go viral. Speed is the story.",
    platforms: ["X", "Farcaster", "TikTok"],
    rewardPool: 8500,
    paidOut: 6300,
    ratePer1k: 1.8,
    minViews: 2500,
    clippers: 341,
    tags: ["L1", "Launch"],
  },
  {
    id: "pumpfun-meme-engine",
    project: "Pump.fun",
    accent: "#2dba7c",
    tagline: "Meme-first clips. The funnier it spreads, the more you earn.",
    platforms: ["TikTok", "Instagram", "X"],
    rewardPool: 15000,
    paidOut: 9800,
    ratePer1k: 4.0,
    minViews: 10000,
    clippers: 902,
    tags: ["Memes", "Consumer"],
  },
  {
    id: "jupiter-defi-explainers",
    project: "Jupiter",
    accent: "#59e6a8",
    tagline: "Short explainers that turn swaps into routes anyone gets.",
    platforms: ["YouTube", "X"],
    rewardPool: 6000,
    paidOut: 1450,
    ratePer1k: 2.0,
    minViews: 3000,
    clippers: 76,
    tags: ["DeFi", "Education"],
  },
  {
    id: "base-onchain-summer",
    project: "Base",
    accent: "#8ef5c6",
    tagline: "Recap the best onchain moments. Bring it everywhere.",
    platforms: ["X", "Farcaster", "YouTube"],
    rewardPool: 20000,
    paidOut: 11200,
    ratePer1k: 3.0,
    minViews: 7500,
    clippers: 514,
    tags: ["L2", "Culture"],
  },
  {
    id: "arc-network-genesis",
    project: "Arc Network",
    accent: "#2dba7c",
    tagline: "Show what sub-second USDC settlement actually feels like.",
    platforms: ["X", "TikTok"],
    rewardPool: 10000,
    paidOut: 800,
    ratePer1k: 2.2,
    minViews: 4000,
    clippers: 33,
    tags: ["Infra", "Testnet"],
  },
];

export const marketStats = {
  totalPaidOut: campaigns.reduce((s, c) => s + c.paidOut, 0),
  activeCampaigns: campaigns.length,
  clippers: campaigns.reduce((s, c) => s + c.clippers, 0),
};

export const usdc = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
