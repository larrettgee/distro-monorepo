import { type Campaign, usdc } from "@/lib/campaigns";
import { ClipButton } from "./ClipButton";

export function CampaignCard({ c }: { c: Campaign }) {
  const pct = Math.min(100, Math.round((c.paidOut / c.rewardPool) * 100));

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-hairline bg-panel p-5 transition-colors hover:border-network/70">
      <header className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-ink"
          style={{ backgroundColor: c.accent }}
        >
          {c.project[0]}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-tight text-cloud">{c.project}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {c.tags.map((t) => (
              <span key={t} className="rounded-full bg-teal/60 px-2 py-0.5 text-[11px] text-mint">
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-cloud/70">{c.tagline}</p>

      <div className="flex flex-wrap gap-1.5">
        {c.platforms.map((p) => (
          <span key={p} className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-cloud/60">
            {p}
          </span>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-hairline pt-4 text-sm">
        <div>
          <dt className="text-xs text-cloud/50">Rate</dt>
          <dd className="font-display font-bold text-distro">${c.ratePer1k.toFixed(2)} / 1k views</dd>
        </div>
        <div>
          <dt className="text-xs text-cloud/50">Reward pool</dt>
          <dd className="font-display font-bold text-cloud">{usdc(c.rewardPool)}</dd>
        </div>
      </dl>

      <div>
        <div className="mb-1 flex justify-between text-[11px] text-cloud/50">
          <span>{usdc(c.paidOut)} paid out</span>
          <span>
            {c.clippers} clippers · {pct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-teal/50">
          <div className="h-full rounded-full bg-network" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ClipButton project={c.project} />
    </article>
  );
}
