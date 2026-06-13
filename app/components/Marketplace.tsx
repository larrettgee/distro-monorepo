"use client";

import { useMemo, useState } from "react";
import { Topbar } from "./Topbar";
import { NetworkGuard } from "./NetworkGuard";
import { Hero } from "./Hero";
import { ScrollRow } from "./ScrollRow";
import { FeaturedCard } from "./FeaturedCard";
import { TrendingCard } from "./TrendingCard";
import { ExploreSection } from "./ExploreSection";
import { OnboardingGate } from "./onboarding/OnboardingGate";
import { StateBlock, AlertIcon, InboxIcon, Spinner } from "./StateBlock";
import { useCampaigns } from "@/lib/api/hooks";
import { adaptCampaign } from "@/lib/api/adapt";

export function Marketplace() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch, isFetching } = useCampaigns();

  const items = useMemo(() => (data ?? []).map(adaptCampaign), [data]);
  const featured = items.slice(0, 6);
  const trending = items.slice(0, 8);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <OnboardingGate />
      <Topbar query={query} onQueryChange={setQuery} />
      <NetworkGuard />

      <main className="flex-1 space-y-10 px-4 py-6 md:px-6">
        <Hero items={items} />

        {isLoading && (
          <div className="flex justify-center py-16 text-cloud/40">
            <Spinner size={26} />
          </div>
        )}

        {isError && (
          <StateBlock
            icon={<AlertIcon />}
            title="Couldn't load campaigns"
            description="We couldn't reach the server. It may be waking up — try again in a moment."
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
        )}

        {!isLoading && !isError && items.length === 0 && (
          <StateBlock
            icon={<InboxIcon />}
            title="No campaigns yet"
            description="Be the first brand to launch one — hit Create to fund a campaign and upload your source content."
          />
        )}

        {items.length > 0 && (
          <>
            <ScrollRow id="top" title="Top campaigns">
              {featured.map((c) => (
                <FeaturedCard key={c.id} c={c} />
              ))}
            </ScrollRow>

            <ScrollRow id="trending" title="Trending now">
              {trending.map((c) => (
                <TrendingCard key={c.id} c={c} />
              ))}
            </ScrollRow>

            <ExploreSection items={items} query={query} />
          </>
        )}
      </main>
    </div>
  );
}
