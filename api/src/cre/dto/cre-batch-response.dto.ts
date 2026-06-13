import { ApiProperty } from '@nestjs/swagger';
import type {
  AggregatedRecipient,
  DailyBatchPayload,
  JobBatch,
} from '../cre.types';

export class AggregatedRecipientDto implements AggregatedRecipient {
  @ApiProperty({
    description: 'Clipper wallet (lowercase) to credit on-chain.',
    example: '0x000000000000000000000000000000000000dead',
  })
  wallet!: string;

  @ApiProperty({
    description:
      'Summed cumulative views across this wallet’s clips in the campaign.',
    example: 1782456094,
  })
  cumulativeViews!: number;
}

export class JobBatchDto implements JobBatch {
  @ApiProperty({ description: 'On-chain DistroEscrow job id.', example: 3 })
  jobId!: number;

  @ApiProperty({
    description:
      'EscrowViewsReporter (job operator) the CRE submits the report to.',
    example: '0x716f3b0b885Cf0Edd1Be17E1DF62560acbCE212F',
  })
  reporterAddress!: string;

  @ApiProperty({ type: AggregatedRecipientDto, isArray: true })
  recipients!: AggregatedRecipientDto[];
}

export class CreBatchResponseDto implements DailyBatchPayload {
  @ApiProperty({ description: 'UTC day key for this batch.', example: '2026-06-13' })
  dateKey!: string;

  @ApiProperty({ description: 'Target chain id.', example: 5042002 })
  chainId!: number;

  @ApiProperty({
    description:
      'Determinism-bucket start (ISO). Stable within a bucket so concurrent ' +
      'DON-node calls see an identical payload.',
  })
  generatedAt!: string;

  @ApiProperty({ type: JobBatchDto, isArray: true })
  jobs!: JobBatchDto[];
}

export class RefreshResultDto {
  @ApiProperty({ description: 'Submissions whose view count was refreshed.', example: 3 })
  refreshed!: number;

  @ApiProperty({ description: 'Submissions whose refresh failed (kept prior count).', example: 0 })
  failed!: number;
}
