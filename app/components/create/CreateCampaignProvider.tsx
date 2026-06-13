"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { CreateCampaignModal } from "./CreateCampaignModal";

type CreateModalValue = {
  open: boolean;
  openCreate: () => void;
  closeCreate: () => void;
};

const CreateModalContext = createContext<CreateModalValue | null>(null);

export function useCreateModal() {
  const ctx = useContext(CreateModalContext);
  if (!ctx) throw new Error("useCreateModal must be used within <CreateCampaignProvider>");
  return ctx;
}

/** Hosts the brand create-campaign modal app-wide. */
export function CreateCampaignProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CreateModalContext.Provider
      value={{ open, openCreate: () => setOpen(true), closeCreate: () => setOpen(false) }}
    >
      {children}
      <CreateCampaignModal open={open} onClose={() => setOpen(false)} />
    </CreateModalContext.Provider>
  );
}
