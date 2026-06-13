import { ApiProperty } from '@nestjs/swagger';

export class ClipperStatsDto {
  @ApiProperty({
    nullable: true,
    example: 4,
    description: 'Position on the global leaderboard, or null with no clips yet.',
  })
  rank!: number | null;

  @ApiProperty({ example: 152000, description: 'Total views across non-rejected clips.' })
  totalViews!: number;

  @ApiProperty({ example: 12, description: 'Number of non-rejected clips submitted.' })
  clipCount!: number;

  @ApiProperty({
    example: 304.5,
    description: 'Estimated gross USDC earned. Not a settlement figure.',
  })
  estimatedEarningsUsdc!: number;

  @ApiProperty({
    example: 87,
    description: 'Total clippers with at least one non-rejected clip.',
  })
  totalClippers!: number;
}
