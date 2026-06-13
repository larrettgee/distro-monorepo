"use client";

import { useState } from "react";
import { useBalance } from "wagmi";
import {
  writeContract,
  waitForTransactionReceipt,
  switchChain,
} from "@wagmi/core";
import { config as wagmiConfig } from "@/lib/wagmi";
import { arcTestnet } from "@/lib/chains";
import { distroEscrowAbi } from "@/lib/escrowAbi";
import {
  useMyAccount,
  useAccountOverview,
  useUpdateUsername,
} from "@/lib/api/hooks";
import type { AccountOverview, ClaimableJob } from "@/lib/api/types";
import { usdc } from "@/lib/campaigns";
import { VerifyWorldId } from "@/components/VerifyWorldId";
import { VerificationBadge } from "@/components/VerificationMark";
import { StateBlock, Spinner } from "@/components/StateBlock";
import { IconCheck, IconX, IconCopy } from "@/components/icons";

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

export function AccountView() {
  const { data: account, isLoading } = useMyAccount();
  const { data: overview } = useAccountOverview();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-cloud/40">
        <Spinner size={26} />
      </div>
    );
  }

  if (!account?.initialized) {
    return (
      <StateBlock
        title="No account yet"
        description="Sign in and pick a role to set up your account."
      />
    );
  }

  const isClipper = account.type === "clipper";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="border-b border-hairline pb-5">
        <h1 className="font-display text-3xl font-bold tracking-tight text-cloud">
          Account
        </h1>
        <p className="mt-1 text-sm text-cloud/50">
          Your {account.type} profile, balances, and payouts.
        </p>
      </header>

      <IdentityCard />

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-cloud/40">
          Overview
        </h2>
        {isClipper ? (
          <ClipperStats overview={overview} />
        ) : (
          <BrandStats overview={overview} />
        )}
      </section>

      {isClipper && <ClaimSection overview={overview} />}
    </div>
  );
}

/* ─── Identity: username (editable), verification, wallet balance ─── */

function IdentityCard() {
  const { data: account } = useMyAccount();
  const update = useUpdateUsername();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  const address = account?.walletAddress as `0x${string}` | undefined;
  const { data: balance } = useBalance({ address });
  const verified = account?.verificationStatus === "verified";

  function startEdit() {
    setValue(account?.username ?? "");
    update.reset();
    setEditing(true);
  }

  async function save() {
    const next = value.trim();
    if (!next || next === account?.username) {
      setEditing(false);
      return;
    }
    try {
      await update.mutateAsync(next);
      setEditing(false);
    } catch {
      /* error rendered below */
    }
  }

  async function copy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const balanceLabel = balance
    ? `$${Number(balance.formatted).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "…";

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {/* Profile */}
      <div className="rounded-2xl border border-hairline bg-panel p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-cloud/40">Username</p>
          {account?.verificationStatus && (
            <VerificationBadge status={account.verificationStatus} />
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-white/25"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-cloud/70 transition hover:bg-panel-2"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={update.isPending}
                className="flex-1 rounded-lg bg-distro px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-mint disabled:opacity-50"
              >
                {update.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <p className="truncate font-display text-2xl font-bold text-cloud">
              {account?.username ?? "—"}
            </p>
            <button
              onClick={startEdit}
              className="rounded-md px-2 py-1 text-xs font-medium text-cloud/50 transition hover:bg-panel-2 hover:text-cloud"
            >
              Edit
            </button>
          </div>
        )}

        {update.error && (
          <p className="mt-1 text-xs text-red-300">
            {update.error instanceof Error ? update.error.message : "Couldn't update"}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-cloud/45">
          <span className="font-mono">
            {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
          </span>
          {address && (
            <button
              onClick={copy}
              className="grid h-6 w-6 place-items-center rounded text-cloud/40 transition hover:bg-panel-2 hover:text-cloud"
              aria-label="Copy address"
              title={copied ? "Copied" : "Copy address"}
            >
              {copied ? <IconCheck size={13} className="text-distro" /> : <IconCopy size={13} />}
            </button>
          )}
        </div>

        {!verified && <VerifyWorldId />}
      </div>

      {/* Wallet balance */}
      <div className="rounded-2xl border border-hairline bg-panel p-5">
        <p className="text-xs uppercase tracking-wide text-cloud/40">Wallet balance</p>
        <p className="mt-1 font-display text-3xl font-bold text-distro">{balanceLabel}</p>
        <p className="mt-1 text-xs text-cloud/45">USDC on Arc</p>
      </div>
    </section>
  );
}

/* ─── Stat blocks ─── */

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-panel px-4 py-4">
      <p className="text-xs text-cloud/50">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          highlight ? "text-distro" : "text-cloud"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BrandStats({ overview }: { overview?: AccountOverview }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat label="Campaigns funded" value={`${overview?.campaignsCount ?? 0}`} />
      <Stat
        label="Total spent"
        value={overview ? usdc(overview.totalSpentUsdc ?? 0) : "…"}
      />
      <Stat
        label="Held in escrow"
        value={overview ? usdc(overview.inEscrowUsdc ?? 0) : "…"}
        highlight
      />
    </div>
  );
}

function ClipperStats({ overview }: { overview?: AccountOverview }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Total views" value={overview ? compact(overview.totalViews ?? 0) : "…"} />
      <Stat label="Clips" value={`${overview?.clipCount ?? 0}`} />
      <Stat
        label="Est. earnings"
        value={overview ? usdc(overview.estimatedEarningsUsdc ?? 0) : "…"}
      />
      <Stat
        label="Claimable"
        value={overview ? usdc(overview.claimableUsdc ?? 0) : "…"}
        highlight
      />
    </div>
  );
}

/* ─── On-chain claim ─── */

function ClaimSection({ overview }: { overview?: AccountOverview }) {
  const { refetch } = useAccountOverview();
  const [claiming, setClaiming] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number[]>([]);

  const jobs = overview?.claimable ?? [];

  async function claim(job: ClaimableJob) {
    if (!overview?.walletAddress) return;
    setError(null);
    setClaiming(job.jobId);
    try {
      try {
        await switchChain(wagmiConfig, { chainId: arcTestnet.id });
      } catch {
        /* already on chain / switch declined-but-correct — let the write surface a real error */
      }
      const hash = await writeContract(wagmiConfig, {
        address: overview.escrowAddress as `0x${string}`,
        abi: distroEscrowAbi,
        functionName: "claim",
        args: [BigInt(job.jobId), overview.walletAddress as `0x${string}`],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash });
      setDone((d) => [...d, job.jobId]);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(null);
    }
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-cloud/40">
        Claim earnings
      </h2>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-panel/40 px-4 py-8 text-center text-sm text-cloud/45">
          Nothing to claim yet. As your clips accrue verified views, your payout
          becomes claimable here.
        </div>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => {
            const claimed = done.includes(job.jobId);
            return (
              <li
                key={job.jobId}
                className="flex items-center gap-4 rounded-xl border border-hairline bg-panel px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cloud">
                    {job.campaignTitle}
                  </p>
                  <p className="text-xs text-cloud/45">Job #{job.jobId}</p>
                </div>
                <span className="font-display text-lg font-bold text-distro">
                  {usdc(job.owedUsdc)}
                </span>
                {claimed ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-distro">
                    <IconCheck size={16} /> Claimed
                  </span>
                ) : (
                  <button
                    onClick={() => claim(job)}
                    disabled={claiming !== null}
                    className="shrink-0 rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-50"
                  >
                    {claiming === job.jobId ? "Claiming…" : "Claim"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
          <IconX size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
