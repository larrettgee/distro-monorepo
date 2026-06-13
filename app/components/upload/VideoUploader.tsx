"use client";

import { useRef, useState, type DragEvent } from "react";
import type { UploadAsset, UploadDriver, UploadStatus } from "@/lib/upload/types";
import { mockDriver } from "@/lib/upload/mockDriver";
import { IconUpload, IconFilm, IconX, IconCheck } from "@/components/icons";

type Item = {
  id: string;
  file: File;
  status: UploadStatus;
  percent: number;
  asset?: UploadAsset;
  error?: string;
  cancel?: () => void;
};

export type VideoUploaderProps = {
  /** transport — defaults to the mock driver (no backend needed) */
  driver?: UploadDriver;
  accept?: string;
  multiple?: boolean;
  /** soft size cap in bytes; files above this are rejected client-side */
  maxSizeBytes?: number;
  onComplete?: (assets: UploadAsset[]) => void;
};

const DEFAULT_MAX = 5 * 1024 * 1024 * 1024; // 5 GB

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function VideoUploader({
  driver = mockDriver,
  accept = "video/*",
  multiple = true,
  maxSizeBytes = DEFAULT_MAX,
  onComplete,
}: VideoUploaderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  function start(file: File) {
    const id = uid();

    if (accept.startsWith("video/") && !file.type.startsWith("video/")) {
      setItems((p) => [...p, { id, file, status: "error", percent: 0, error: "Not a video file" }]);
      return;
    }
    if (file.size > maxSizeBytes) {
      setItems((p) => [
        ...p,
        { id, file, status: "error", percent: 0, error: `Over ${formatBytes(maxSizeBytes)} limit` },
      ]);
      return;
    }

    const handle = driver.upload(file, {
      onProgress: (p) => update(id, { percent: p.percent, status: "uploading" }),
    });

    setItems((p) => [
      ...p,
      { id, file, status: "uploading", percent: 0, cancel: handle.cancel },
    ]);

    handle.done
      .then((asset) => {
        update(id, { status: "done", percent: 100, asset });
        onComplete?.([asset]);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Upload failed";
        update(id, { status: msg === "Upload canceled" ? "canceled" : "error", error: msg });
      });
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(start);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.status === "uploading") it.cancel?.();
      return prev.filter((x) => x.id !== id);
    });
  }

  return (
    <div className="space-y-4">
      {/* dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-distro bg-distro/5" : "border-hairline hover:border-white/25 hover:bg-panel-2"
        }`}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-panel-2 text-cloud/70">
          <IconUpload size={22} />
        </span>
        <span className="text-sm font-medium text-cloud">Drop source video here, or click to browse</span>
        <span className="text-xs text-cloud/45">MP4, MOV, WebM · up to {formatBytes(maxSizeBytes)}</span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </button>

      {/* file list */}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-panel-2 p-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink text-cloud/60">
                <IconFilm size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-cloud">{it.file.name}</span>
                  <span className="shrink-0 text-xs text-cloud/45">{formatBytes(it.file.size)}</span>
                </div>

                {it.status === "uploading" && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink">
                    <div
                      className="h-full rounded-full bg-distro transition-[width] duration-150"
                      style={{ width: `${it.percent}%` }}
                    />
                  </div>
                )}

                <p className="mt-1 text-xs">
                  {it.status === "uploading" && <span className="text-cloud/50">{it.percent}%</span>}
                  {it.status === "done" && (
                    <span className="flex items-center gap-1 text-distro">
                      <IconCheck size={13} /> Uploaded
                    </span>
                  )}
                  {it.status === "error" && <span className="text-red-300">{it.error}</span>}
                  {it.status === "canceled" && <span className="text-cloud/40">Canceled</span>}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-cloud/50 transition-colors hover:bg-ink hover:text-cloud"
                aria-label="Remove"
              >
                <IconX size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
