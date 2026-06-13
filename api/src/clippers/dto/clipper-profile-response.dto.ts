import { ApiProperty } from '@nestjs/swagger';

export class ClipperProfileResponseDto {
  @ApiProperty({ description: 'Whether a YouTube channel is verified-connected.' })
  connected!: boolean;

  @ApiProperty({ nullable: true })
  youtubeChannelId!: string | null;

  @ApiProperty({ nullable: true })
  youtubeHandle!: string | null;

  @ApiProperty({
    description: 'Pending verification code awaiting bio placement, if any.',
    nullable: true,
  })
  pendingCode!: string | null;
}

export class StartConnectResponseDto {
  @ApiProperty({ description: 'Code to paste into the YouTube channel bio.' })
  code!: string;

  @ApiProperty({ description: 'The channel reference being connected.' })
  channelUrl!: string;

  @ApiProperty({ description: 'Human instructions for the clipper.' })
  instructions!: string;
}
