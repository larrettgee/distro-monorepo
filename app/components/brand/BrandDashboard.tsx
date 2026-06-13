"use client";

import Link from "next/link";
import { useMyAccount, useMyCampaigns } from "@/lib/api/hooks";
import { useCreateModal } from "@/components/create/CreateCampaignProvider";
import { usdc } from "@/lib/campaigns";
import { StateBlock, InboxIcon, Spinner } from "@/components/StateBlock";

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
      <StateBlock
        title="Brands only"
        description="Switch to a brand account to create and manage campaigns."
      />
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
        <div className="flex justify-center py-16 text-cloud/40">
          <Spinner size={24} />
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="mt-6">
          <StateBlock
            className="w-full"
            icon={<InboxIcon />}
            title="No campaigns yet"
            description="Create your first campaign to fund a bounty and start getting clips."
            action={
              <button
                onClick={openCreate}
                className="rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
              >
                Create campaign
              </button>
            }
          />
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
