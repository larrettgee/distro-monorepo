"use client";

import { useCampaign, useMyAccount } from "@/lib/api/hooks";
import { usdc } from "@/lib/campaigns";
import { PerformancePanel } from "./PerformancePanel";
import { SubmitPanel } from "./SubmitPanel";

export function CampaignDetail({ id }: { id: string }) {
  const { data: campaign, isLoading, isError } = useCampaign(id);
  const { data: account } = useMyAccount();

  if (isLoading) return <p className="text-sm text-cloud/50">Loading campaign…</p>;
  if (isError || !campaign) return <p className="text-sm text-red-300">Campaign not found.</p>;

  const ownsCampaign =
    account?.type === "brand" &&
    account.walletAddress?.toLowerCase() === campaign.brandWallet.toLowerCase();
  const isClipper = account?.type === "clipper";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <div className="flex items-center gap-2 text-xs text-cloud/50">
          <span className="rounded-md bg-panel-2 px-2 py-0.5 capitalize">{campaign.status.replace("_", " ")}</span>
          <span>by {campaign.brandUsername}</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-cloud">{campaign.title}</h1>
        <p className="mt-2 leading-relaxed text-cloud/70">{campaign.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-hairline bg-panel px-4 py-3">
            <p className="text-xs text-cloud/50">Reward pool</p>
            <p className="mt-1 font-display text-xl font-bold text-distro">{usdc(campaign.budgetUsdc)}</p>
          </div>
          <div className="rounded-xl border border-hairline bg-panel px-4 py-3">
            <p className="text-xs text-cloud/50">Rate / 1k views</p>
            <p className="mt-1 font-display text-xl font-bold text-cloud">
              ${campaign.ratePerThousandViews.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-panel px-4 py-3">
            <p className="text-xs text-cloud/50">Platforms</p>
            <p className="mt-1 text-sm text-cloud">{campaign.platforms.join(", ")}</p>
          </div>
        </div>

        {campaign.systemRules && (
          <p className="mt-4 rounded-lg border border-hairline bg-panel-2 p-3 text-sm text-cloud/70">
            <span className="font-semibold text-cloud">Rules:</span> {campaign.systemRules}
          </p>
        )}
        <a
          href={campaign.sourceContentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm text-distro underline underline-offset-2"
        >
          View source content
        </a>
      </header>

      {ownsCampaign ? (
        <PerformancePanel campaignId={campaign.id} />
      ) : isClipper ? (
        <SubmitPanel campaignId={campaign.id} />
      ) : (
        <p className="rounded-xl border border-hairline bg-panel p-4 text-sm text-cloud/60">
          Sign in as a clipper to submit clips for this campaign.
        </p>
      )}
    </div>
  );
}
