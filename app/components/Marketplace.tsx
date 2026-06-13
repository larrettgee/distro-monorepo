"use client";

import { useState } from "react";
import { Topbar } from "./Topbar";
import { NetworkGuard } from "./NetworkGuard";
import { ScrollRow } from "./ScrollRow";
import { FeaturedCard } from "./FeaturedCard";
import { TrendingCard } from "./TrendingCard";
import { ExploreSection } from "./ExploreSection";
import { campaigns } from "@/lib/campaigns";

export function Marketplace() {
  const [query, setQuery] = useState("");

  const featured = campaigns.slice(0, 6);
  const trending = [...campaigns.slice(3), ...campaigns.slice(0, 2)];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar query={query} onQueryChange={setQuery} />
      <NetworkGuard />

      <main className="flex-1 space-y-10 px-4 py-6 md:px-6">
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

        <ExploreSection query={query} />
      </main>
    </div>
  );
}
