import { ApiProperty } from '@nestjs/swagger';

class RpContextDto {
  @ApiProperty({ example: 'rp_123456789abcdef0' })
  rp_id!: string;

  @ApiProperty()
  nonce!: string;

  @ApiProperty({ description: 'Unix seconds.' })
  created_at!: number;

  @ApiProperty({ description: 'Unix seconds.' })
  expires_at!: number;

  @ApiProperty({ description: 'RP ECDSA signature.' })
  signature!: string;
}

export class RpContextResponseDto {
  @ApiProperty({ example: 'app_...' })
  appId!: string;

  @ApiProperty({ example: 'verify-account' })
  action!: string;

  @ApiProperty({ enum: ['production', 'staging'] })
  environment!: 'production' | 'staging';

  @ApiProperty({
    type: RpContextDto,
    description: 'Pass as the IDKitRequestWidget rp_context prop.',
  })
  rpContext!: RpContextDto;
}
