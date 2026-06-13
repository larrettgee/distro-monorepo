"use client";

import Link from "next/link";
import { useCampaign, useMyAccount } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { usdc } from "@/lib/campaigns";
import { StateBlock, AlertIcon, SearchOffIcon, Spinner } from "@/components/StateBlock";
import { PerformancePanel } from "./PerformancePanel";
import { SubmitPanel } from "./SubmitPanel";

export function CampaignDetail({ id }: { id: string }) {
  const { data: campaign, isLoading, isError, error, refetch, isFetching } = useCampaign(id);
  const { data: account } = useMyAccount();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-cloud/40">
        <Spinner size={26} />
      </div>
    );
  }

  if (isError || !campaign) {
    const notFound = error instanceof ApiError && error.status === 404;
    return notFound ? (
      <StateBlock
        icon={<SearchOffIcon />}
        title="Campaign not found"
        description="This campaign may have been removed, or the link is wrong."
        action={
          <Link
            href="/"
            className="rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
          >
            Browse campaigns
          </Link>
        }
      />
    ) : (
      <StateBlock
        icon={<AlertIcon />}
        title="Couldn't load this campaign"
        description="We couldn't reach the server. Try again in a moment."
        action={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-60"
          >
            {isFetching ? "Retrying…" : "Try again"}
          </button>
        }
      />
    );
  }

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
