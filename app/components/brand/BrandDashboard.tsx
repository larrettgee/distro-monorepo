"use client";

import Link from "next/link";
import { useMyAccount, useMyCampaigns } from "@/lib/api/hooks";
import { useCreateModal } from "@/components/create/CreateCampaignProvider";
import { usdc } from "@/lib/campaigns";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending_onchain: "Pending funding",
  closed: "Closed",
};

export function BrandDashboard() {
  const { data: account } = useMyAccount();
  const { data: campaigns, isLoading } = useMyCampaigns();
  const { openCreate } = useCreateModal();

  if (account && account.type !== "brand") {
    return (
      <p className="text-sm text-cloud/60">This dashboard is for brand accounts.</p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cloud">My campaigns</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
        >
          Create campaign
        </button>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-cloud/50">Loading…</p>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-hairline bg-panel p-10 text-center">
          <p className="text-sm text-cloud/60">You haven&apos;t created any campaigns yet.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Link
                href={`/campaign/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-panel p-4 transition-colors hover:border-distro/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cloud">{c.title}</p>
                  <p className="mt-0.5 text-xs text-cloud/50">
                    {STATUS_LABEL[c.status] ?? c.status} · ${c.ratePerThousandViews.toFixed(2)}/1k
                  </p>
                </div>
                <span className="shrink-0 font-display text-lg font-bold text-distro">
                  {usdc(c.budgetUsdc)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
