import { ApiProperty } from '@nestjs/swagger';
import type { SubmissionStatus } from '../submissions.types';

export class SubmissionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  campaignId!: string;

  @ApiProperty()
  videoId!: string;

  @ApiProperty()
  videoUrl!: string;

  @ApiProperty()
  channelId!: string;

  @ApiProperty({ enum: ['pending', 'accepted', 'rejected'] })
  status!: SubmissionStatus;

  @ApiProperty({ nullable: true })
  lastViewCount!: number | null;

  @ApiProperty({ description: 'ISO 8601 creation timestamp.' })
  createdAt!: string;
}

export class RejectedSubmissionDto {
  @ApiProperty()
  url!: string;

  @ApiProperty({ description: 'Why the URL was not accepted.' })
  reason!: string;
}

export class CreateSubmissionsResultDto {
  @ApiProperty({ type: SubmissionResponseDto, isArray: true })
  accepted!: SubmissionResponseDto[];

  @ApiProperty({ type: RejectedSubmissionDto, isArray: true })
  rejected!: RejectedSubmissionDto[];
}
