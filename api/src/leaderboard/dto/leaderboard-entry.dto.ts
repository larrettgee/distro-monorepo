import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({
    example: 1,
    description: '1-based position, ranked by total views.',
  })
  rank!: number;

  @ApiProperty({
    example: 'clipqueen',
    description: 'Clipper public username (falls back to a shortened wallet).',
  })
  username!: string;

  @ApiProperty({ example: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' })
  walletAddress!: string;

  @ApiProperty({
    example: 152000,
    description: 'Total views across all non-rejected clips.',
  })
  totalViews!: number;

  @ApiProperty({
    example: 12,
    description: 'Number of non-rejected clips submitted.',
  })
  clipCount!: number;

  @ApiProperty({
    example: 304.5,
    description:
      'Estimated gross USDC earned (views priced at each campaign’s per-1k rate). Not a settlement figure.',
  })
  estimatedEarningsUsdc!: number;
}
