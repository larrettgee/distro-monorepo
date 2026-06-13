"use client";

import type { UploadDriver } from "@/lib/upload/types";
import { VideoUploader } from "./VideoUploader";
import { Modal } from "@/components/Modal";
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
  return (
    <Modal
      open={open}
      onDismiss={onClose}
      aria-label="Upload source content"
      panelClassName="w-full max-w-lg rounded-2xl border border-hairline bg-panel p-5 shadow-2xl shadow-black/60"
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
    </Modal>
  );
}
