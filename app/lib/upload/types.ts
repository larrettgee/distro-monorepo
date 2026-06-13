export type UploadStatus = "queued" | "uploading" | "done" | "error" | "canceled";

export type UploadProgress = { loaded: number; total: number; percent: number };

export type UploadAsset = {
  /** provider asset id (or a local id for the mock driver) */
  id: string;
  /** playback / preview URL, if the provider returns one */
  url?: string;
  fileName: string;
  size: number;
  contentType: string;
};

/** A single in-flight upload. */
export type UploadHandle = {
  /** resolves when the upload finishes, rejects on error/cancel */
  done: Promise<UploadAsset>;
  /** abort the upload */
  cancel: () => void;
};

/**
 * Pluggable transport. Swap the mock driver for a real one (Cloudflare Stream,
 * R2/S3 presigned, Mux, Vercel Blob) without touching any UI.
 */
export type UploadDriver = {
  name: string;
  upload: (file: File, handlers?: { onProgress?: (p: UploadProgress) => void }) => UploadHandle;
};
