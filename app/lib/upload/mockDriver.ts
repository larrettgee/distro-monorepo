import type { UploadAsset, UploadDriver } from "./types";

/**
 * Mock transport for the baseline UI: simulates upload progress and resolves
 * with a local object-URL preview. No backend or credentials required.
 *
 * Replace with a real driver (see {@link ./presignedPutDriver}) once storage
 * is wired up.
 */
export const mockDriver: UploadDriver = {
  name: "mock",
  upload(file, handlers) {
    let canceled = false;
    let timer: ReturnType<typeof setTimeout>;
    const total = file.size || 1;

    const done = new Promise<UploadAsset>((resolve, reject) => {
      let loaded = 0;
      const step = Math.max(total / 40, 1); // ~40 ticks regardless of size

      const tick = () => {
        if (canceled) {
          reject(new Error("Upload canceled"));
          return;
        }
        loaded = Math.min(total, loaded + step);
        handlers?.onProgress?.({ loaded, total, percent: Math.round((loaded / total) * 100) });

        if (loaded >= total) {
          resolve({
            id: `mock_${Math.random().toString(36).slice(2, 10)}`,
            url: URL.createObjectURL(file),
            fileName: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          });
        } else {
          timer = setTimeout(tick, 80);
        }
      };

      timer = setTimeout(tick, 120);
    });

    return {
      done,
      cancel: () => {
        canceled = true;
        clearTimeout(timer);
      },
    };
  },
};
