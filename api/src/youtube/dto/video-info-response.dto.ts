import { ApiProperty } from '@nestjs/swagger';
import { ChannelInfoResponseDto } from './channel-info-response.dto';

export class VideoInfoResponseDto {
  @ApiProperty({ description: 'YouTube video id.', example: 'dQw4w9WgXcQ' })
  videoId!: string;

  @ApiProperty({ description: 'Video title.' })
  title!: string;

  @ApiProperty({ description: 'ISO 8601 video publish timestamp.' })
  publishedAt!: string;

  @ApiProperty({
    description: 'Total view count. Null when YouTube hides the statistic.',
    example: 1600000000,
    nullable: true,
  })
  viewCount!: number | null;

  @ApiProperty({
    description: 'Like count. Null when YouTube hides the statistic.',
    nullable: true,
  })
  likeCount!: number | null;

  @ApiProperty({
    description: 'Comment count. Null when YouTube hides the statistic.',
    nullable: true,
  })
  commentCount!: number | null;

  @ApiProperty({ type: ChannelInfoResponseDto })
  channel!: ChannelInfoResponseDto;
}
