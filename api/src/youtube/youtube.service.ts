import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { AppConfig } from '../config/configuration';
import { ChannelInfoResponseDto } from './dto/channel-info-response.dto';
import { VideoInfoResponseDto } from './dto/video-info-response.dto';
import { YOUTUBE_ENDPOINTS, YOUTUBE_PARTS } from './youtube.constants';
import type {
  ChannelRef,
  YtChannelItem,
  YtListResponse,
  YtVideoItem,
} from './youtube.types';
import { extractChannelRef, extractVideoId } from './youtube.utils';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // ─── Queries ───

  async getVideoInfo(url: string): Promise<VideoInfoResponseDto> {
    const video = await this.fetchVideo(url);
    const channel = await this.fetchChannelByRef({
      type: 'id',
      value: video.snippet.channelId,
    });

    return {
      videoId: video.id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
      viewCount: this.toNullableNumber(video.statistics.viewCount),
      likeCount: this.toNullableNumber(video.statistics.likeCount),
      commentCount: this.toNullableNumber(video.statistics.commentCount),
      channel: this.toChannelInfo(channel),
    };
  }

  async getChannelInfo(url: string): Promise<ChannelInfoResponseDto> {
    const channel = await this.resolveChannel(url);
    return this.toChannelInfo(channel);
  }

  // ─── Internal helpers ───

  private async fetchVideo(url: string): Promise<YtVideoItem> {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new BadRequestException(`Could not extract a video id from: ${url}`);
    }

    const data = await this.request<YtListResponse<YtVideoItem>>(
      YOUTUBE_ENDPOINTS.videos,
      { part: YOUTUBE_PARTS.videoStatistics, id: videoId },
    );
    const video = data.items?.[0];
    if (!video) {
      throw new NotFoundException(`No YouTube video found for id: ${videoId}`);
    }
    return video;
  }

  /** Resolve a channel from a channel URL/handle/id, or from a video URL. */
  private async resolveChannel(url: string): Promise<YtChannelItem> {
    const ref = extractChannelRef(url);
    if (ref) {
      return this.fetchChannelByRef(ref);
    }

    // Fall back to treating the input as a video URL and resolving its channel.
    const videoId = extractVideoId(url);
    if (videoId) {
      const video = await this.fetchVideo(url);
      return this.fetchChannelByRef({
        type: 'id',
        value: video.snippet.channelId,
      });
    }

    throw new BadRequestException(
      `Could not resolve a channel or video from: ${url}`,
    );
  }

  private async fetchChannelByRef(ref: ChannelRef): Promise<YtChannelItem> {
    const params: Record<string, string> = { part: YOUTUBE_PARTS.channel };
    if (ref.type === 'id') {
      params.id = ref.value;
    } else if (ref.type === 'handle') {
      params.forHandle = ref.value;
    } else {
      params.forUsername = ref.value;
    }

    const data = await this.request<YtListResponse<YtChannelItem>>(
      YOUTUBE_ENDPOINTS.channels,
      params,
    );
    const channel = data.items?.[0];
    if (!channel) {
      throw new NotFoundException(
        `No YouTube channel found for ${ref.type}: ${ref.value}`,
      );
    }
    return channel;
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<T> {
    const apiKey = this.config.get('youtube.apiKey', { infer: true });
    if (!apiKey) {
      throw new InternalServerErrorException(
        'YOUTUBE_API_KEY is not configured.',
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.get<T>(endpoint, { params: { ...params, key: apiKey } }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      this.logger.error(
        `YouTube API request to ${endpoint} failed${
          status ? ` (status ${status})` : ''
        }: ${axiosError.message}`,
      );
      if (status === 400 || status === 403) {
        throw new BadGatewayException(
          'YouTube API rejected the request (check API key, quota, or parameters).',
        );
      }
      throw new BadGatewayException('YouTube API request failed.');
    }
  }

  private toChannelInfo(channel: YtChannelItem): ChannelInfoResponseDto {
    const { snippet, statistics } = channel;
    return {
      channelId: channel.id,
      title: snippet.title,
      description: snippet.description,
      customUrl: snippet.customUrl ?? null,
      subscriberCount: this.toNullableNumber(statistics.subscriberCount),
      viewCount: this.toNullableNumber(statistics.viewCount),
      videoCount: this.toNullableNumber(statistics.videoCount),
      publishedAt: snippet.publishedAt,
      thumbnailUrl:
        snippet.thumbnails?.high?.url ??
        snippet.thumbnails?.medium?.url ??
        snippet.thumbnails?.default?.url ??
        null,
    };
  }

  private toNullableNumber(value: string | undefined): number | null {
    return value === undefined ? null : Number(value);
  }
}
