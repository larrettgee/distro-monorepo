import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ConfirmCampaignDto {
  @ApiProperty({
    description: 'Transaction hash of the brand’s createJob() call.',
    example: '0x' + 'a'.repeat(64),
  })
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'txHash must be a 32-byte hex hash.' })
  txHash!: string;
}
