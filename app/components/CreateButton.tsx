"use client";

import type { ReactNode } from "react";
import { useCreateModal } from "./create/CreateCampaignProvider";
import { IconPlus } from "./icons";

/** Opens the create-campaign modal. Used in the sidebar and top bar. */
export function CreateButton({
  variant = "primary",
  className = "",
  children,
}: {
  variant?: "primary" | "outline";
  className?: string;
  children: ReactNode;
}) {
  const { openCreate } = useCreateModal();

  const styles =
    variant === "primary"
      ? "bg-distro text-ink hover:bg-mint"
      : "border border-hairline text-cloud hover:border-white/20 hover:bg-panel";

  return (
    <button
      onClick={openCreate}
      className={`flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition active:scale-[0.98] ${styles} ${className}`}
    >
      <IconPlus size={17} />
      {children}
    </button>
  );
}
