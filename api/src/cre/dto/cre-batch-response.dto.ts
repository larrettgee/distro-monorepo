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
    example: '0x78203f4Dd20968808cFD05A094e9cCfF4E781089',
  })
  reporterAddress!: string;

  @ApiProperty({ type: AggregatedRecipientDto, isArray: true })
  recipients!: AggregatedRecipientDto[];
}

export class CreBatchResponseDto implements DailyBatchPayload {
  @ApiProperty({ description: 'UTC day key for this snapshot.', example: '2026-06-13' })
  dateKey!: string;

  @ApiProperty({ description: 'Target chain id.', example: 5042002 })
  chainId!: number;

  @ApiProperty({ description: 'ISO timestamp the snapshot was generated.' })
  generatedAt!: string;

  @ApiProperty({ type: JobBatchDto, isArray: true })
  jobs!: JobBatchDto[];
}
