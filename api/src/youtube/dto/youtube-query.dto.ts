import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VideoUrlQueryDto {
  @ApiProperty({
    description: 'A YouTube video URL (watch, youtu.be, shorts, embed) or raw 11-char video id.',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class ChannelLookupQueryDto {
  @ApiProperty({
    description:
      'A YouTube channel URL (/channel/UC…, /@handle, /user/…), a handle like "@name", a raw channel id, or a video URL to resolve the channel from.',
    example: 'https://www.youtube.com/@veritasium',
  })
  @IsString()
  @IsNotEmpty()
  url!: string;
}
