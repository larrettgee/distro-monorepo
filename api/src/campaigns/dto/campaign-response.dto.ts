import { ApiProperty } from '@nestjs/swagger';
import type {
  CampaignPlatform,
  CampaignStatus,
} from '../campaigns.types';

export class CampaignResponseDto {
  @ApiProperty({ description: 'Campaign id.' })
  id!: string;

  @ApiProperty({ description: 'Brand wallet address.' })
  brandWallet!: string;

  @ApiProperty({ description: "Brand's public username." })
  brandUsername!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ description: 'Source content video URL.' })
  sourceContentUrl!: string;

  @ApiProperty({ enum: ['youtube'], isArray: true })
  platforms!: CampaignPlatform[];

  @ApiProperty()
  systemRules!: string;

  @ApiProperty({ description: 'Total budget in USDC.' })
  budgetUsdc!: number;

  @ApiProperty({ description: 'USDC paid out / allocated to clippers so far.' })
  paidUsdc!: number;

  @ApiProperty({ description: 'USDC per 1,000 views.' })
  ratePerThousandViews!: number;

  @ApiProperty({ enum: ['pending_onchain', 'active', 'closed'] })
  status!: CampaignStatus;

  @ApiProperty({ description: 'On-chain escrow job id once confirmed.', nullable: true })
  onchainJobId!: number | null;

  @ApiProperty({ nullable: true })
  createTxHash!: string | null;

  @ApiProperty({ description: 'ISO 8601 creation timestamp.' })
  createdAt!: string;
}

/** On-chain parameters the brand's wallet must use to fund the campaign. */
export class OnchainCreateParamsDto {
  @ApiProperty({
    description: 'Funding method. On Arc the budget is the native gas token (USDC).',
    enum: ['native'],
  })
  funding!: 'native';

  @ApiProperty({ description: 'DistroEscrow contract address.' })
  escrowAddress!: string;

  @ApiProperty({ description: 'Operator address to pass to createJobNative (recordViews caller).' })
  operator!: string;

  @ApiProperty({ description: 'pricePerThousandViews in native wei (string).' })
  pricePerThousandViews!: string;

  @ApiProperty({ description: 'budget in native wei (string). Send this as the call value.' })
  budget!: string;

  @ApiProperty({ description: 'Chain id (Arc testnet).' })
  chainId!: number;
}

export class CreateCampaignResponseDto {
  @ApiProperty({ type: CampaignResponseDto })
  campaign!: CampaignResponseDto;

  @ApiProperty({
    type: OnchainCreateParamsDto,
    description:
      'Call escrow.createJobNative(operator, pricePerThousandViews) with value=budget from the brand wallet, then POST /campaigns/:id/confirm with the tx hash.',
  })
  onchain!: OnchainCreateParamsDto;
}

export class CampaignPerformanceDto {
  @ApiProperty({ type: CampaignResponseDto })
  campaign!: CampaignResponseDto;

  @ApiProperty({ description: 'Total budget on-chain (USDC).', nullable: true })
  budgetUsdc!: number | null;

  @ApiProperty({ description: 'Amount allocated to clippers (USDC).', nullable: true })
  allocatedUsdc!: number | null;

  @ApiProperty({ description: 'Remaining unallocated budget (USDC).', nullable: true })
  remainingUsdc!: number | null;

  @ApiProperty({ description: 'Whether the on-chain job is closed.', nullable: true })
  closed!: boolean | null;
}
