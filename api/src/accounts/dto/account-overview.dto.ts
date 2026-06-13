import { ApiProperty } from '@nestjs/swagger';
import type { AccountType, VerificationStatus } from '../accounts.types';

export class ClaimableJobDto {
  @ApiProperty() campaignId!: string;
  @ApiProperty() campaignTitle!: string;
  @ApiProperty({ description: 'On-chain escrow job id.' }) jobId!: number;
  @ApiProperty({ description: 'USDC currently claimable for this job.' })
  owedUsdc!: number;
}

/**
 * Role-aware account overview. Brand fields (`*Spent*`, `inEscrowUsdc`) and
 * clipper fields (`*Earnings*`, `claimable*`) are null for the other role.
 * Wallet balance is read client-side from the chain, not included here.
 */
export class AccountOverviewDto {
  @ApiProperty({ nullable: true }) type!: AccountType | null;
  @ApiProperty({ nullable: true }) username!: string | null;
  @ApiProperty({ nullable: true })
  verificationStatus!: VerificationStatus | null;
  @ApiProperty({ nullable: true }) walletAddress!: string | null;

  // On-chain context for client-side claim transactions.
  @ApiProperty() escrowAddress!: string;
  @ApiProperty() chainId!: number;

  // ─── Brand ───
  @ApiProperty({ nullable: true }) campaignsCount!: number | null;
  @ApiProperty({
    nullable: true,
    description: 'Total USDC committed to funded campaigns.',
  })
  totalSpentUsdc!: number | null;
  @ApiProperty({
    nullable: true,
    description: 'USDC still held in escrow across the brand’s open jobs.',
  })
  inEscrowUsdc!: number | null;

  // ─── Clipper ───
  @ApiProperty({ nullable: true }) totalViews!: number | null;
  @ApiProperty({ nullable: true }) clipCount!: number | null;
  @ApiProperty({ nullable: true }) estimatedEarningsUsdc!: number | null;
  @ApiProperty({
    nullable: true,
    description: 'USDC currently claimable on-chain across all jobs.',
  })
  claimableUsdc!: number | null;
  @ApiProperty({ type: [ClaimableJobDto], nullable: true })
  claimable!: ClaimableJobDto[] | null;
}
