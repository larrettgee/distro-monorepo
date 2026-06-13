import { ApiProperty } from '@nestjs/swagger';

export class ChannelInfoResponseDto {
  @ApiProperty({ description: 'Channel id.', example: 'UCuAXFkgsw1L7xaCfnd5JJOw' })
  channelId!: string;

  @ApiProperty({ description: 'Channel title.' })
  title!: string;

  @ApiProperty({ description: 'Channel description / bio.' })
  description!: string;

  @ApiProperty({
    description: 'Custom URL handle, when set.',
    example: '@veritasium',
    nullable: true,
  })
  customUrl!: string | null;

  @ApiProperty({
    description: 'Subscriber count. Null when hidden by the channel.',
    nullable: true,
  })
  subscriberCount!: number | null;

  @ApiProperty({ description: 'Total channel view count.', nullable: true })
  viewCount!: number | null;

  @ApiProperty({ description: 'Number of public videos.', nullable: true })
  videoCount!: number | null;

  @ApiProperty({ description: 'ISO 8601 channel creation timestamp.' })
  publishedAt!: string;

  @ApiProperty({
    description: 'High-resolution channel thumbnail URL, when available.',
    nullable: true,
  })
  thumbnailUrl!: string | null;
}
