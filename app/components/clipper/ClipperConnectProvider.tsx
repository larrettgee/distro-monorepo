"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ClipperConnectModal } from "./ClipperConnectModal";

type Value = { open: boolean; openConnect: () => void; closeConnect: () => void };

const Ctx = createContext<Value | null>(null);

export function useClipperConnect() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClipperConnect must be used within <ClipperConnectProvider>");
  return ctx;
}

export function ClipperConnectProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, openConnect: () => setOpen(true), closeConnect: () => setOpen(false) }}>
      {children}
      <ClipperConnectModal open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}
