import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChannelInfoResponseDto } from './dto/channel-info-response.dto';
import { VideoInfoResponseDto } from './dto/video-info-response.dto';
import {
  ChannelLookupQueryDto,
  VideoUrlQueryDto,
} from './dto/youtube-query.dto';
import { YoutubeService } from './youtube.service';

@ApiTags('youtube')
@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('videos')
  @ApiOperation({
    summary: 'Get full video info',
    description:
      'Returns video stats plus the publishing channel (bio, handle, subscriber count, etc.) from a video URL or id.',
  })
  @ApiOkResponse({ type: VideoInfoResponseDto })
  @ApiBadRequestResponse({ description: 'URL did not contain a valid video id.' })
  getVideoInfo(@Query() query: VideoUrlQueryDto): Promise<VideoInfoResponseDto> {
    return this.youtubeService.getVideoInfo(query.url);
  }

  @Get('channels')
  @ApiOperation({
    summary: 'Get channel info (bio and stats)',
    description:
      'Returns channel description/bio and statistics. Accepts a channel URL, handle, channel id, or a video URL to resolve the channel from.',
  })
  @ApiOkResponse({ type: ChannelInfoResponseDto })
  @ApiBadRequestResponse({
    description: 'URL did not resolve to a channel or video.',
  })
  getChannelInfo(
    @Query() query: ChannelLookupQueryDto,
  ): Promise<ChannelInfoResponseDto> {
    return this.youtubeService.getChannelInfo(query.url);
  }
}
