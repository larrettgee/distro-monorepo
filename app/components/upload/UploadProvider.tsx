"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { UploadDriver } from "@/lib/upload/types";
import { UploadModal } from "./UploadModal";

type UploadContextValue = {
  open: boolean;
  openUpload: () => void;
  closeUpload: () => void;
};

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within <UploadProvider>");
  return ctx;
}

/**
 * App-wide host for the content upload modal. Any component can call
 * `useUpload().openUpload()`. Swap in a real transport via `driver` once
 * storage is wired up (defaults to the mock driver).
 */
export function UploadProvider({
  children,
  driver,
}: {
  children: ReactNode;
  driver?: UploadDriver;
}) {
  const [open, setOpen] = useState(false);

  return (
    <UploadContext.Provider
      value={{ open, openUpload: () => setOpen(true), closeUpload: () => setOpen(false) }}
    >
      {children}
      <UploadModal open={open} onClose={() => setOpen(false)} driver={driver} />
    </UploadContext.Provider>
  );
}
