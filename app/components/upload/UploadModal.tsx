"use client";

import { useEffect } from "react";
import type { UploadDriver } from "@/lib/upload/types";
import { VideoUploader } from "./VideoUploader";
import { IconX } from "@/components/icons";

export function UploadModal({
  open,
  onClose,
  driver,
}: {
  open: boolean;
  onClose: () => void;
  /** override the transport (defaults to the mock driver) */
  driver?: UploadDriver;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload source content"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-hairline bg-panel p-5 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-cloud">Upload source content</h2>
            <p className="mt-0.5 text-sm text-cloud/50">
              Your original videos. Clippers create cuts from these.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-cloud/60 transition-colors hover:bg-panel-2 hover:text-cloud"
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="mt-5">
          <VideoUploader driver={driver} />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
