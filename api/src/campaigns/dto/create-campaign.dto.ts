import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import {
  CAMPAIGN_PLATFORMS,
  type CampaignPlatform,
} from '../campaigns.types';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign / bounty title.' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Campaign description and brief.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'URL of the brand’s source content video to be clipped.' })
  @IsUrl()
  sourceContentUrl!: string;

  @ApiProperty({
    description: 'Rules clippers must follow.',
    required: false,
  })
  @IsOptional()
  @IsString()
  systemRules?: string;

  @ApiProperty({
    description: 'Total budget in USDC (human units).',
    example: 1000,
  })
  @IsNumber()
  @IsPositive()
  budgetUsdc!: number;

  @ApiProperty({
    description: 'Payout rate in USDC per 1,000 verified views (CPM).',
    example: 2.5,
  })
  @IsNumber()
  @IsPositive()
  ratePerThousandViews!: number;

  @ApiProperty({
    description: 'Allowed social platforms. Only YouTube is supported for now.',
    enum: CAMPAIGN_PLATFORMS,
    isArray: true,
    required: false,
    default: ['youtube'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(CAMPAIGN_PLATFORMS, { each: true })
  platforms?: CampaignPlatform[];
}
