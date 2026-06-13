import type { UploadAsset, UploadDriver } from "./types";

export type CreateUploadUrl = (file: {
  name: string;
  type: string;
  size: number;
}) => Promise<{
  /** presigned PUT URL (R2 / S3 / Vercel Blob, etc.) */
  uploadUrl: string;
  /** identifiers your backend assigns to the asset */
  asset: { id: string; url?: string };
  /** any extra headers the presigned URL requires */
  headers?: Record<string, string>;
}>;

/**
 * Real transport: asks your authenticated backend for a one-time upload URL,
 * then PUTs the file straight to storage with progress + cancel. No extra deps.
 *
 *   const driver = createPresignedPutDriver(async (file) => {
 *     const res = await fetch("/api/uploads/create-url", {
 *       method: "POST",
 *       headers: { "content-type": "application/json", authorization: `Bearer ${privyToken}` },
 *       body: JSON.stringify(file),
 *     });
 *     return res.json();
 *   });
 *
 * NOTE: for very large videos prefer a resumable (tus) driver — Cloudflare
 * Stream and Mux both support tus, which survives flaky connections and pauses.
 * This single-shot PUT driver is the simplest production-ready option for
 * R2 / S3 / Blob presigned uploads.
 */
export function createPresignedPutDriver(createUploadUrl: CreateUploadUrl): UploadDriver {
  return {
    name: "presigned-put",
    upload(file, handlers) {
      const controller = new AbortController();
      let xhr: XMLHttpRequest | null = null;

      const done = (async (): Promise<UploadAsset> => {
        const { uploadUrl, asset, headers } = await createUploadUrl({
          name: file.name,
          type: file.type,
          size: file.size,
        });

        return new Promise<UploadAsset>((resolve, reject) => {
          xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          if (file.type) xhr.setRequestHeader("Content-Type", file.type);
          for (const [k, v] of Object.entries(headers ?? {})) xhr.setRequestHeader(k, v);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              handlers?.onProgress?.({
                loaded: e.loaded,
                total: e.total,
                percent: Math.round((e.loaded / e.total) * 100),
              });
            }
          };
          xhr.onload = () =>
            xhr && xhr.status >= 200 && xhr.status < 300
              ? resolve({
                  id: asset.id,
                  url: asset.url,
                  fileName: file.name,
                  size: file.size,
                  contentType: file.type,
                })
              : reject(new Error(`Upload failed (${xhr?.status ?? "no response"})`));
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.onabort = () => reject(new Error("Upload canceled"));

          controller.signal.addEventListener("abort", () => xhr?.abort());
          xhr.send(file);
        });
      })();

      return { done, cancel: () => controller.abort() };
    },
  };
}
