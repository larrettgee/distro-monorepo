// Types mirroring the NestJS API DTOs (see api/src/**/dto).

export type AccountType = "brand" | "clipper";
export type VerificationStatus = "verified" | "unverified";
export type CampaignStatus = "pending_onchain" | "active" | "closed";
export type SubmissionStatus = "pending" | "accepted" | "rejected";

export type RegisterAccountInput = { type: AccountType; username: string };

export type Account = {
  initialized: boolean;
  privyId: string;
  walletAddress: string | null;
  username: string | null;
  type: AccountType | null;
  verificationStatus: VerificationStatus | null;
};

export type Campaign = {
  id: string;
  brandWallet: string;
  brandUsername: string;
  title: string;
  description: string;
  sourceContentUrl: string;
  platforms: string[];
  systemRules: string;
  budgetUsdc: number;
  paidUsdc: number;
  ratePerThousandViews: number;
  status: CampaignStatus;
  onchainJobId: number | null;
  createTxHash: string | null;
  createdAt: string;
};

/** On-chain params returned alongside a newly created campaign (native funding). */
export type CampaignOnchain = {
  funding: "native";
  escrowAddress: string;
  operator: string;
  /** pricePerThousandViews in native wei (string) */
  pricePerThousandViews: string;
  /** budget in native wei (string) — send as the call value */
  budget: string;
  chainId: number;
};

export type CreateCampaignInput = {
  title: string;
  description: string;
  sourceContentUrl: string;
  systemRules?: string;
  budgetUsdc: number;
  ratePerThousandViews: number;
  platforms?: string[];
};

export type CreateCampaignResult = { campaign: Campaign; onchain: CampaignOnchain };

export type CampaignPerformance = {
  campaign: Campaign;
  budgetUsdc: number | null;
  allocatedUsdc: number | null;
  remainingUsdc: number | null;
  closed: boolean | null;
};

export type SocialPlatform = "youtube" | "x" | "tiktok" | "instagram";

export type ConnectedChannel = {
  platform: string;
  channelId: string;
  handle: string | null;
  title: string | null;
  thumbnailUrl: string | null;
  connectedAt: string;
};

export type ClipperProfile = {
  connected: boolean;
  channels: ConnectedChannel[];
  pendingCode: string | null;
};

export type StartConnectResult = {
  code: string;
  channelUrl: string;
  instructions: string;
};

export type Submission = {
  id: string;
  campaignId: string;
  videoId: string;
  videoUrl: string;
  channelId: string;
  status: SubmissionStatus;
  lastViewCount: number | null;
  createdAt: string;
};

export type CreateSubmissionsResult = {
  accepted: Submission[];
  rejected: { url: string; reason: string }[];
};

export type YoutubeChannel = {
  channelId: string;
  title: string;
  description: string;
  customUrl: string | null;
  subscriberCount: number | null;
  viewCount: number | null;
  videoCount: number | null;
  publishedAt: string;
  thumbnailUrl: string | null;
};

export type YoutubeVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  channel: YoutubeChannel;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  walletAddress: string;
  totalViews: number;
  clipCount: number;
  /** Estimated gross USDC (views priced at each campaign's per-1k rate). */
  estimatedEarningsUsdc: number;
};

export type ClipperStats = {
  rank: number | null;
  totalViews: number;
  clipCount: number;
  estimatedEarningsUsdc: number;
  totalClippers: number;
};

export type ClaimableJob = {
  campaignId: string;
  campaignTitle: string;
  jobId: number;
  owedUsdc: number;
};

export type AccountOverview = {
  type: AccountType | null;
  username: string | null;
  verificationStatus: VerificationStatus | null;
  walletAddress: string | null;
  escrowAddress: string;
  chainId: number;
  // Brand
  campaignsCount: number | null;
  totalSpentUsdc: number | null;
  inEscrowUsdc: number | null;
  // Clipper
  totalViews: number | null;
  clipCount: number | null;
  estimatedEarningsUsdc: number | null;
  claimableUsdc: number | null;
  claimable: ClaimableJob[] | null;
};

export type WorldIdContext = {
  appId: string;
  action: string;
  environment: "production" | "staging";
  rpContext: {
    rp_id: string;
    nonce: string;
    created_at: number;
    expires_at: number;
    signature: string;
  };
};
