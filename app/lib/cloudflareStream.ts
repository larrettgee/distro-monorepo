// Cloudflare Stream URL helpers.
//
// A Stream "UID" is a 32-char hex id. Cloudflare exposes two customer-agnostic
// delivery domains that work WITHOUT knowing your account's customer subdomain:
//   - iframe.cloudflarestream.com/<uid>      → embeddable player page
//   - videodelivery.net/<uid>/...            → thumbnails, manifests, downloads
// We store/handle whatever URL form we have and recover the UID from it, so old
// rows that saved the (invalid) `cloudflarestream.com/<uid>` form still resolve.

const UID_RE = /([0-9a-f]{32})/i;

/** Pull the Stream UID out of any sourceContentUrl we may have stored. */
export function streamUid(source: string | null | undefined): string | null {
  if (!source) return null;
  const match = source.match(UID_RE);
  return match ? match[1] : null;
}

/** Public thumbnail JPEG — works without a customer subdomain. */
export function streamThumbnail(uid: string, opts?: { time?: string; width?: number }): string {
  const params = new URLSearchParams();
  if (opts?.time) params.set("time", opts.time);
  if (opts?.width) params.set("width", String(opts.width));
  const query = params.toString();
  return `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg${query ? `?${query}` : ""}`;
}

/** Universal embeddable player page (no subdomain required). */
export function streamPlayer(uid: string): string {
  return `https://iframe.cloudflarestream.com/${uid}`;
}

/**
 * Our cached thumbnail proxy. Fetches the Cloudflare thumbnail once and serves
 * it from our own cache, so it loads instantly after the first hit. Prefer this
 * over {@link streamThumbnail} anywhere we render in the UI.
 */
export function streamThumbnailCached(uid: string): string {
  return `/api/stream/${uid}/thumbnail`;
}

/** Account's public Cloudflare Stream customer subdomain (e.g. `customer-abc123`). */
const SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN;

/**
 * Direct MP4 download URL on the account's customer subdomain. Cloudflare serves
 * it with `Content-Disposition: attachment`, so the browser downloads it — no
 * server round-trip. Requires downloads to have been enabled once for the video
 * (see {@link streamEnableDownloadEndpoint}, fired at upload time). Returns null
 * if the subdomain isn't configured. Downloads are NOT served from
 * `videodelivery.net`, only from the customer subdomain.
 */
export function streamDownload(uid: string): string | null {
  return SUBDOMAIN ? `https://${SUBDOMAIN}.cloudflarestream.com/${uid}/downloads/default.mp4` : null;
}

/**
 * Our server endpoint that enables Cloudflare MP4 downloads (idempotent, needs
 * the secret API token). This is a one-time setup per video — the driver fires
 * it at upload time so the direct {@link streamDownload} URL works thereafter.
 */
export function streamEnableDownloadEndpoint(uid: string): string {
  return `/api/stream/${uid}/download`;
}
