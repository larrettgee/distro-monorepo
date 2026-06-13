import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectChannelDto {
  @ApiProperty({
    description:
      'YouTube channel URL, @handle, or channel id to connect to this clipper.',
    example: 'https://www.youtube.com/@veritasium',
  })
  @IsString()
  @IsNotEmpty()
  channelUrl!: string;
}
