"use client";

import { useMemo, useState } from "react";
import type { Campaign } from "@/lib/campaigns";
import { CampaignCard } from "./CampaignCard";
import { IconGrid } from "./icons";

export function ExploreSection({ items, query }: { items: Campaign[]; query: string }) {
  const [active, setActive] = useState<string>("All");

  const filters = useMemo(
    () => ["All", ...Array.from(new Set(items.map((c) => c.category)))],
    [items],
  );

  const q = query.trim().toLowerCase();
  const results = items.filter((c) => {
    const matchesCat = active === "All" || c.category === active;
    const matchesQuery =
      q === "" || `${c.brand} ${c.title} ${c.handle} ${c.category}`.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <section id="explore" className="mt-10 scroll-mt-20">
      <h2 className="font-display text-xl font-bold text-cloud">Explore campaigns</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active === f
                  ? "bg-distro text-ink"
                  : "border border-hairline text-cloud/70 hover:border-white/20 hover:bg-panel hover:text-cloud"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-sm text-cloud/70">
          <IconGrid size={16} />
          Grid
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-8 text-sm text-cloud/50">No campaigns match your search.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c) => (
            <CampaignCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
