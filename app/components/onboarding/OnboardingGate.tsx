"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useMyAccount, useRegisterAccount } from "@/lib/api/hooks";
import type { AccountType } from "@/lib/api/types";
import { Modal } from "@/components/Modal";
import { IconCampaigns, IconFilm } from "@/components/icons";

/**
 * Shown once a user is logged in via Privy but hasn't chosen an account type.
 * Registering moves them from "uninitialized" to a typed (still unverified)
 * account. World ID verification happens later.
 */
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export function OnboardingGate() {
  const { ready, authenticated } = usePrivy();
  const { data: account, isLoading } = useMyAccount();
  const register = useRegisterAccount();
  const [picked, setPicked] = useState<AccountType | null>(null);
  const [username, setUsername] = useState("");

  // Only gate once we positively know the account is uninitialized.
  const open = ready && authenticated && !isLoading && !!account && !account.initialized;

  const trimmed = username.trim();
  const usernameValid = trimmed.length >= 3 && trimmed.length <= 20 && USERNAME_RE.test(trimmed);
  const showHint = trimmed.length > 0 && !usernameValid;

  function choose(type: AccountType) {
    if (!usernameValid) return;
    setPicked(type);
    register.mutate({ type, username: trimmed });
  }

  return (
    <Modal
      open={open}
      overlayClassName="z-[70]"
      backdropClassName="bg-black/80"
      panelClassName="w-full max-w-md rounded-2xl border border-hairline bg-panel p-6"
    >
        <h2 className="font-display text-xl font-bold text-cloud">Welcome to Distro</h2>
        <p className="mt-1 text-sm text-cloud/55">Pick a username, then choose how you&apos;ll use Distro.</p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-medium text-cloud/50">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoFocus
            spellCheck={false}
            className="w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-sm text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25"
          />
          {showHint && (
            <span className="mt-1 block text-xs text-amber-300">
              3–20 characters · letters, numbers, and underscores only
            </span>
          )}
        </label>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <RoleCard
            icon={<IconCampaigns size={20} />}
            title="I'm a Brand"
            body="Fund campaigns and upload source content for clippers to cut."
            disabled={register.isPending || !usernameValid}
            loading={register.isPending && picked === "brand"}
            onClick={() => choose("brand")}
          />
          <RoleCard
            icon={<IconFilm size={20} />}
            title="I'm a Clipper"
            body="Browse bounties, clip content, and earn USDC for the views you drive."
            disabled={register.isPending || !usernameValid}
            loading={register.isPending && picked === "clipper"}
            onClick={() => choose("clipper")}
          />
        </div>

        {register.isError && (
          <p className="mt-4 text-sm text-red-300">
            {register.error instanceof Error ? register.error.message : "Registration failed"}
          </p>
        )}

        <p className="mt-4 text-xs text-cloud/40">
          You can use the platform right away. World ID verification is required later before
          clippers can receive funds.
        </p>
    </Modal>
  );
}

function RoleCard({
  icon,
  title,
  body,
  onClick,
  disabled,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-start gap-3 rounded-xl border border-hairline bg-panel-2 p-4 text-left transition hover:border-distro/50 disabled:opacity-60"
    >
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-distro">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-cloud">
          {loading ? "Setting up…" : title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-cloud/55">{body}</span>
      </span>
    </button>
  );
}
