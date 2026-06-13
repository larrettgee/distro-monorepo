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

export type ClipperProfile = {
  connected: boolean;
  youtubeChannelId: string | null;
  youtubeHandle: string | null;
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
