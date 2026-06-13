"use client";

import { useMemo } from "react";
import { useCampaigns } from "@/lib/api/hooks";
import { adaptCampaign } from "@/lib/api/adapt";
import { TrendingCard } from "@/components/TrendingCard";
import { StateBlock, AlertIcon, InboxIcon, Spinner } from "@/components/StateBlock";

export function Trending() {
  const { data, isLoading, isError, refetch, isFetching } = useCampaigns();
  const items = useMemo(() => (data ?? []).map(adaptCampaign), [data]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-hairline pb-5">
        <h1 className="font-display text-3xl font-bold tracking-tight text-cloud">
          Trending
        </h1>
        <p className="mt-1 text-sm text-cloud/50">
          The campaigns clippers are jumping on right now.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20 text-cloud/40">
          <Spinner size={26} />
        </div>
      ) : isError ? (
        <div className="mt-10">
          <StateBlock
            icon={<AlertIcon />}
            title="Couldn't load campaigns"
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
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10">
          <StateBlock
            className="w-full"
            icon={<InboxIcon />}
            title="Nothing trending yet"
            description="As brands launch campaigns, the hottest ones will surface here."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-7">
          {items.map((c) => (
            <TrendingCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
