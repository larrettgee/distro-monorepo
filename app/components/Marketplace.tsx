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
import { useCampaigns } from "@/lib/api/hooks";
import { adaptCampaign } from "@/lib/api/adapt";

export function Marketplace() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error } = useCampaigns();

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

        {isLoading && <p className="text-sm text-cloud/50">Loading campaigns…</p>}

        {isError && (
          <p className="text-sm text-red-300">
            Couldn&apos;t load campaigns{error instanceof Error ? `: ${error.message}` : ""}.
          </p>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="rounded-2xl border border-hairline bg-panel p-10 text-center">
            <h2 className="font-display text-xl font-bold text-cloud">No campaigns yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-cloud/55">
              Be the first brand to launch one — hit “Create” to fund a campaign and upload your
              source content.
            </p>
          </div>
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
