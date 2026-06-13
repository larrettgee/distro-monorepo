import Link from "next/link";
import { type Campaign, usdcCompact } from "@/lib/campaigns";
import { Thumb } from "./Thumb";
import { IconClock, IconUsers } from "./icons";

export function FeaturedCard({ c }: { c: Campaign }) {
  return (
    <Link
      href={`/campaign/${c.id}`}
      className="group flex w-[360px] shrink-0 cursor-pointer gap-3 rounded-xl border border-hairline bg-panel p-3 transition-colors duration-200 hover:bg-panel-2">
      <Thumb c={c} className="h-28 w-28 shrink-0 rounded-lg" sizes="112px" />

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-cloud">{c.title}</h3>

        <p className="mt-2 font-display text-2xl font-bold text-distro">
          {usdcCompact(c.rewardPool)}
          <span className="ml-1.5 align-middle text-xs font-medium text-cloud/40">reward</span>
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="flex items-center gap-1.5 text-xs text-cloud/45">
            <IconClock size={14} />
            {c.timeLeft}
          </span>
          <span className="flex items-center gap-2 text-xs text-cloud/70">
            {c.handle}
            <span className="flex items-center gap-1 text-cloud/40">
              <IconUsers size={13} />
              {c.clippers}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
