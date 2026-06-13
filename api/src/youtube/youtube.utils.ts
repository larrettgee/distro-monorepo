import { YOUTUBE_HOSTS } from './youtube.constants';
import type { ChannelRef } from './youtube.types';

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/;

function parseUrl(input: string): URL | null {
  const trimmed = input.trim();
  try {
    return new URL(trimmed);
  } catch {
    // Allow scheme-less inputs like "youtube.com/watch?v=...".
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function isYouTubeHost(host: string): boolean {
  return (YOUTUBE_HOSTS as readonly string[]).includes(host.toLowerCase());
}

/**
 * Extract the 11-character video id from any common YouTube video URL form:
 * watch?v=, youtu.be/<id>, /shorts/<id>, /embed/<id>, /v/<id>, or a bare id.
 * Returns null when no valid video id can be found.
 */
export function extractVideoId(input: string): string | null {
  if (!input) {
    return null;
  }
  if (VIDEO_ID_PATTERN.test(input.trim())) {
    return input.trim();
  }

  const url = parseUrl(input);
  if (!url || !isYouTubeHost(url.hostname)) {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  const fromQuery = url.searchParams.get('v');
  if (fromQuery && VIDEO_ID_PATTERN.test(fromQuery)) {
    return fromQuery;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const prefixes = new Set(['shorts', 'embed', 'v', 'live']);
  if (segments.length >= 2 && prefixes.has(segments[0])) {
    const id = segments[1];
    return VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  return null;
}

/**
 * Resolve a channel reference from a channel URL, handle, or raw id:
 * /channel/UC..., /@handle, /user/<name>, "@handle", or a bare UC… id.
 * Returns null when the input is not a recognisable channel reference.
 */
export function extractChannelRef(input: string): ChannelRef | null {
  if (!input) {
    return null;
  }
  const trimmed = input.trim();

  if (CHANNEL_ID_PATTERN.test(trimmed)) {
    return { type: 'id', value: trimmed };
  }
  if (trimmed.startsWith('@') && trimmed.length > 1) {
    return { type: 'handle', value: trimmed.slice(1) };
  }

  const url = parseUrl(trimmed);
  if (!url || !isYouTubeHost(url.hostname)) {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const [first, second] = segments;
  if (first === 'channel' && second && CHANNEL_ID_PATTERN.test(second)) {
    return { type: 'id', value: second };
  }
  if (first === 'user' && second) {
    return { type: 'username', value: second };
  }
  if (first.startsWith('@') && first.length > 1) {
    return { type: 'handle', value: first.slice(1) };
  }

  return null;
}
