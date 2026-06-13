import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  CAMPAIGN_PLATFORMS,
  CAMPAIGN_STATUSES,
  type CampaignPlatform,
  type CampaignStatus,
} from '../campaigns.types';

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ timestamps: true, collection: 'campaigns' })
export class Campaign {
  @Prop({ required: true, index: true })
  brandPrivyId!: string;

  @Prop({ required: true, lowercase: true, index: true })
  brandWallet!: string;

  /** Brand's public username at creation time (denormalized for display). */
  @Prop({ required: true })
  brandUsername!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  /** The brand's raw "source content" video to be clipped. */
  @Prop({ required: true })
  sourceContentUrl!: string;

  @Prop({ type: [String], enum: CAMPAIGN_PLATFORMS, default: ['youtube'] })
  platforms!: CampaignPlatform[];

  @Prop({ default: '' })
  systemRules!: string;

  /** Human USDC amounts (display); base units are derived for on-chain calls. */
  @Prop({ required: true })
  budgetUsdc!: number;

  /**
   * USDC paid out / allocated to clippers so far (display). Denormalized from
   * the escrow's `allocated`, updated as views are recorded on-chain, so cards
   * and lists can show payout progress without per-item chain reads.
   */
  @Prop({ default: 0 })
  paidUsdc!: number;

  @Prop({ required: true })
  ratePerThousandViews!: number;

  /** ERC-20 token + operator captured at draft time (from config). */
  @Prop({ required: true, lowercase: true })
  tokenAddress!: string;

  @Prop({ required: true, lowercase: true })
  operatorAddress!: string;

  @Prop({
    required: true,
    enum: CAMPAIGN_STATUSES,
    default: 'pending_onchain',
    index: true,
  })
  status!: CampaignStatus;

  /** On-chain DistroEscrow job id, set once the create tx is confirmed. */
  @Prop()
  onchainJobId?: number;

  @Prop()
  createTxHash?: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
