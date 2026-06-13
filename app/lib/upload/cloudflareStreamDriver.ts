import * as tus from "tus-js-client";
import { streamEnableDownloadEndpoint } from "@/lib/cloudflareStream";
import type { UploadAsset, UploadDriver } from "./types";

export type CloudflareStreamOptions = {
  /** server route that creates the one-time direct upload (default /api/uploads/stream) */
  endpoint?: string;
  /** tus chunk size — Cloudflare requires a multiple of 256 KiB, 5–200 MB */
  chunkSize?: number;
  /** optional customer subdomain code, used only to build a playback URL */
  customerSubdomain?: string;
};

/**
 * Resumable Cloudflare Stream upload (tus). Survives dropped connections and
 * pauses — the right choice for large source videos. The browser only talks to
 * our own `endpoint`; the Stream API token never leaves the server.
 */
export function createCloudflareStreamDriver(opts: CloudflareStreamOptions = {}): UploadDriver {
  const endpoint = opts.endpoint ?? "/api/uploads/stream";
  const chunkSize = opts.chunkSize ?? 150 * 1024 * 1024; // 150 MB

  return {
    name: "cloudflare-stream",
    upload(file, handlers) {
      let mediaId: string | undefined;
      let upload: tus.Upload | undefined;

      const done = new Promise<UploadAsset>((resolve, reject) => {
        upload = new tus.Upload(file, {
          endpoint,
          chunkSize,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          metadata: { name: file.name, filetype: file.type || "video/mp4" },
          onAfterResponse: (_req, res) => {
            const id = res.getHeader("stream-media-id");
            if (id) mediaId = id;
          },
          onProgress: (sent, total) =>
            handlers?.onProgress?.({
              loaded: sent,
              total,
              percent: total ? Math.round((sent / total) * 100) : 0,
            }),
          onError: (err) => reject(err instanceof Error ? err : new Error(String(err))),
          onSuccess: () => {
            // Prefer the account's customer subdomain when configured; otherwise
            // fall back to the universal player domain, which works for any
            // account without a subdomain. (`cloudflarestream.com/<id>` is NOT a
            // valid playback URL and 404s.)
            const url = mediaId
              ? opts.customerSubdomain
                ? `https://${opts.customerSubdomain}.cloudflarestream.com/${mediaId}/iframe`
                : `https://iframe.cloudflarestream.com/${mediaId}`
              : undefined;
            // Enable MP4 downloads now (fire-and-forget, one-time, token-gated)
            // so the direct customer-subdomain download URL works by the time a
            // brand opens the campaign. The actual download is then served
            // straight from Cloudflare, no server round-trip.
            if (mediaId) {
              void fetch(streamEnableDownloadEndpoint(mediaId), { method: "POST" }).catch(() => {});
            }
            resolve({
              id: mediaId ?? "unknown",
              url,
              fileName: file.name,
              size: file.size,
              contentType: file.type,
            });
          },
        });
        upload.start();
      });

      return { done, cancel: () => void upload?.abort(true) };
    },
  };
}
