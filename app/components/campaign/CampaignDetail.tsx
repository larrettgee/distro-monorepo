"use client";

import Link from "next/link";
import { useCampaign, useMyAccount } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { usdc } from "@/lib/campaigns";
import { streamDownload, streamPlayer, streamThumbnailCached, streamUid } from "@/lib/cloudflareStream";
import { StateBlock, AlertIcon, SearchOffIcon, Spinner } from "@/components/StateBlock";
import { IconDownload, IconPlay } from "@/components/icons";
import { YouTubeLogo, TikTokLogo, XLogo, InstagramLogo } from "@/components/create/platformIcons";
import { PerformancePanel } from "./PerformancePanel";
import { SubmitPanel } from "./SubmitPanel";

const PLATFORM_LOGOS: Record<string, (p: { size?: number; className?: string }) => React.ReactElement> = {
  youtube: YouTubeLogo,
  tiktok: TikTokLogo,
  x: XLogo,
  twitter: XLogo,
  instagram: InstagramLogo,
};

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

  const uid = streamUid(campaign.sourceContentUrl);
  const downloadUrl = uid ? streamDownload(uid) : null;
  const rules = (campaign.systemRules ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <div className="flex items-center gap-2 text-xs text-cloud/50">
          <span className="rounded-md bg-panel-2 px-2 py-0.5 capitalize">
            {campaign.status.replace("_", " ")}
          </span>
          <span>by {campaign.brandUsername}</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-cloud">{campaign.title}</h1>
        <p className="mt-2 leading-relaxed text-cloud/70">{campaign.description}</p>

        {/* Source content preview */}
        <div className="mt-5 overflow-hidden rounded-xl border border-hairline bg-panel">
          {uid ? (
            <a
              href={streamPlayer(uid)}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-video w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={streamThumbnailCached(uid)}
                alt={`${campaign.title} source content`}
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-ink/30 transition group-hover:bg-ink/20">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-ink/70 text-cloud backdrop-blur-sm transition group-hover:scale-110">
                  <IconPlay size={26} />
                </span>
              </span>
            </a>
          ) : (
            <div className="grid aspect-video w-full place-items-center text-sm text-cloud/40">
              No preview available
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-2.5">
            <span className="text-xs text-cloud/50">Source content</span>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-cloud/80 transition hover:border-white/25 hover:text-cloud"
              >
                <IconDownload size={15} />
                Download
              </a>
            )}
          </div>
        </div>

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
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {campaign.platforms.map((p) => {
                const Logo = PLATFORM_LOGOS[p.toLowerCase()];
                return (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-2 py-1 text-xs capitalize text-cloud"
                  >
                    {Logo && <Logo size={15} />}
                    {p}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {rules.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-cloud/50">Rules</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {rules.map((rule, i) => (
                <li
                  key={i}
                  className="rounded-full border border-hairline bg-panel-2 px-3 py-1 text-xs text-cloud/80"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}
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
