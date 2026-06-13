"use client";

import { useLeaderboard, useMyAccount, useMyClipperStats } from "@/lib/api/hooks";
import { usdc } from "@/lib/campaigns";
import { StateBlock, InboxIcon, Spinner } from "@/components/StateBlock";

/**
 * Compact view count, e.g. 152K / 1.2M. Computed manually (not Intl compact)
 * to keep server and client output identical and avoid hydration mismatches.
 */
function compactViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

const MEDAL: Record<number, string> = {
  1: "text-[#f5c451]",
  2: "text-[#c9d1d9]",
  3: "text-[#d8884a]",
};

export function Leaderboard() {
  const { data: entries, isLoading } = useLeaderboard();
  const { data: account } = useMyAccount();
  const { data: myStats } = useMyClipperStats();

  const myWallet = account?.walletAddress?.toLowerCase();
  const hasStats = myStats && (myStats.clipCount > 0 || myStats.rank !== null);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-cloud">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-cloud/50">
            Every clipper ranked by total views across all campaigns.
          </p>
        </div>
        {hasStats && (
          <div className="flex items-stretch divide-x divide-hairline rounded-lg border border-hairline">
            <MiniStat label="Rank" value={myStats.rank ? `#${myStats.rank}` : "—"} />
            <MiniStat label="Views" value={compactViews(myStats.totalViews)} />
            <MiniStat label="Clips" value={`${myStats.clipCount}`} />
            <MiniStat
              label="Est. earnings"
              value={usdc(myStats.estimatedEarningsUsdc)}
              highlight
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-cloud/40">
          <Spinner size={24} />
        </div>
      ) : !entries || entries.length === 0 ? (
        <div className="mt-10">
          <StateBlock
            className="w-full"
            icon={<InboxIcon />}
            title="No clips yet"
            description="As clippers submit videos to campaigns, the top performers will show up here."
          />
        </div>
      ) : (
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-cloud/40">
              <th className="w-16 py-3 pl-4 text-left font-medium">#</th>
              <th className="py-3 text-left font-medium">Clipper</th>
              <th className="hidden py-3 text-right font-medium sm:table-cell">Clips</th>
              <th className="hidden py-3 text-right font-medium sm:table-cell">
                Est. earnings
              </th>
              <th className="py-3 pr-4 text-right font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const isMe = !!myWallet && e.walletAddress.toLowerCase() === myWallet;
              return (
                <tr
                  key={e.walletAddress}
                  className={`border-t border-hairline transition-colors hover:bg-panel/60 ${
                    isMe ? "bg-distro/5" : ""
                  }`}
                >
                  <td className="py-3.5 pl-4">
                    <span
                      className={`font-display text-base font-bold tabular-nums ${
                        MEDAL[e.rank] ?? "text-cloud/35"
                      }`}
                    >
                      {e.rank}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-cloud">{e.username}</span>
                    {isMe && (
                      <span className="ml-2 rounded bg-distro/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-distro">
                        You
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs text-cloud/45 sm:hidden">
                      {e.clipCount} {e.clipCount === 1 ? "clip" : "clips"} ·{" "}
                      {usdc(e.estimatedEarningsUsdc)} est.
                    </span>
                  </td>
                  <td className="hidden py-3.5 text-right tabular-nums text-cloud/70 sm:table-cell">
                    {e.clipCount}
                  </td>
                  <td className="hidden py-3.5 text-right tabular-nums text-cloud/70 sm:table-cell">
                    {usdc(e.estimatedEarningsUsdc)}
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <span className="font-display text-base font-bold tabular-nums text-cloud">
                      {compactViews(e.totalViews)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-4 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-cloud/40">{label}</p>
      <p
        className={`font-display text-sm font-bold tabular-nums ${
          highlight ? "text-distro" : "text-cloud"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
