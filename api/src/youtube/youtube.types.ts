/**
 * Domain and external (YouTube Data API v3) types for the youtube module.
 * The `Yt*` interfaces describe the raw API response shapes consumed by the
 * service; they never leave the service untransformed.
 */

/** How a channel was referenced in a user-supplied URL. */
export type ChannelRefType = 'id' | 'handle' | 'username';

export interface ChannelRef {
  type: ChannelRefType;
  value: string;
}

// ─── Raw YouTube Data API v3 shapes ───

interface YtThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YtThumbnails {
  default?: YtThumbnail;
  medium?: YtThumbnail;
  high?: YtThumbnail;
}

export interface YtVideoItem {
  id: string;
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export interface YtChannelItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails?: YtThumbnails;
  };
  statistics: {
    viewCount?: string;
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    videoCount?: string;
  };
}

export interface YtListResponse<T> {
  items?: T[];
}
