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

/** MP4 download (requires downloads enabled on the video). */
export function streamDownload(uid: string): string {
  return `https://videodelivery.net/${uid}/downloads/default.mp4`;
}
