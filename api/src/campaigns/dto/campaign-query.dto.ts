import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CAMPAIGN_STATUSES, type CampaignStatus } from '../campaigns.types';

export class CampaignQueryDto {
  @ApiProperty({
    description: 'Filter by status. Defaults to active campaigns.',
    enum: CAMPAIGN_STATUSES,
    required: false,
  })
  @IsOptional()
  @IsIn(CAMPAIGN_STATUSES)
  status?: CampaignStatus;
}
