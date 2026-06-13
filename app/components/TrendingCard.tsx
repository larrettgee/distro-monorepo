import { type Campaign, usdcCompact } from "@/lib/campaigns";
import { Thumb } from "./Thumb";

const shadow = { textShadow: "0 1px 10px rgba(0,0,0,0.9)" };

export function TrendingCard({ c }: { c: Campaign }) {
  return (
    <article className="group w-[260px] shrink-0 cursor-pointer">
      <Thumb c={c} className="h-40 rounded-xl" sizes="260px">
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-2xl font-bold text-white" style={shadow}>
            {usdcCompact(c.rewardPool)}
          </p>
          <p className="text-xs font-medium text-white/90" style={shadow}>
            {c.brand}
          </p>
        </div>
      </Thumb>
      <h3 className="mt-2.5 line-clamp-2 text-sm leading-snug text-cloud/75 transition-colors group-hover:text-cloud">
        {c.title}
      </h3>
    </article>
  );
}
