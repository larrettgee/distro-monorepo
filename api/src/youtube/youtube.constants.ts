/** YouTube Data API v3 resource paths (relative to the configured base URL). */
export const YOUTUBE_ENDPOINTS = {
  videos: '/videos',
  channels: '/channels',
} as const;

/** `part` values requested per resource — keep minimal to limit quota cost. */
export const YOUTUBE_PARTS = {
  videoStatistics: 'snippet,statistics',
  channel: 'snippet,statistics',
} as const;

/** Hosts recognised as YouTube when parsing URLs. */
export const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
] as const;
