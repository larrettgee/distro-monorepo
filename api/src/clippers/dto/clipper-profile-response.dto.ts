import { ApiProperty } from '@nestjs/swagger';

export class ConnectedChannelDto {
  @ApiProperty({ description: 'Platform the channel belongs to.', example: 'youtube' })
  platform!: string;

  @ApiProperty({ description: 'Platform-native channel id.' })
  channelId!: string;

  @ApiProperty({ description: 'Public @handle / custom url.', nullable: true })
  handle!: string | null;

  @ApiProperty({ description: 'Channel display name.', nullable: true })
  title!: string | null;

  @ApiProperty({ description: 'Channel avatar/thumbnail url.', nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ description: 'When the channel was verified-connected.' })
  connectedAt!: string;
}

export class ClipperProfileResponseDto {
  @ApiProperty({
    description: 'Whether at least one channel is verified-connected.',
  })
  connected!: boolean;

  @ApiProperty({ type: [ConnectedChannelDto] })
  channels!: ConnectedChannelDto[];

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
