export const CAMPAIGN_STATUSES = [
  'pending_onchain',
  'active',
  'closed',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_PLATFORMS = ['youtube'] as const;
export type CampaignPlatform = (typeof CAMPAIGN_PLATFORMS)[number];
