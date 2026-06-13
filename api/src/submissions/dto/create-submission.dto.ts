import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'YouTube video URLs to submit to the campaign.',
    isArray: true,
    example: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(50)
  @IsUrl({}, { each: true })
  videoUrls!: string[];
}
