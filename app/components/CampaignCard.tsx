import Link from "next/link";
import { type Campaign, usdcCompact } from "@/lib/campaigns";
import { Thumb } from "./Thumb";
import { PoolProgress } from "./PoolProgress";

export function CampaignCard({ c }: { c: Campaign }) {
  return (
    <Link
      href={`/campaign/${c.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-panel transition duration-200 hover:-translate-y-0.5 hover:border-distro/40">
      <Thumb c={c} className="h-32" sizes="(max-width: 640px) 100vw, 300px">
        <p
          className="absolute bottom-2.5 left-2.5 font-display text-xl font-bold text-white"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}
        >
          {usdcCompact(c.rewardPool)}
        </p>
      </Thumb>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-cloud">{c.brand}</span>
          <span className="shrink-0 text-xs text-cloud/40">{c.category}</span>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-cloud/55">{c.title}</p>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-display font-bold text-distro">${c.ratePer1k.toFixed(2)} / 1k</span>
          <span className="text-cloud/45">{c.timeLeft}</span>
        </div>

        <div className="mt-2.5">
          <PoolProgress paid={c.paidOut} budget={c.rewardPool} size="sm" />
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {c.platforms.map((p) => (
            <span key={p} className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-cloud/55">
              {p}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
