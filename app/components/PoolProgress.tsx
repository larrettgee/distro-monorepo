import { usdcCompact } from "@/lib/campaigns";

/**
 * Fun little reward-pool loading bar — animated candy stripes drift across the
 * filled portion. Used on cards, the campaign view, and dashboards so payout
 * progress reads the same everywhere.
 */
export function PoolProgress({
  paid,
  budget,
  size = "md",
  showLabels = true,
}: {
  paid: number;
  budget: number;
  size?: "sm" | "md";
  showLabels?: boolean;
}) {
  const pct = budget > 0 ? Math.min(100, Math.round((paid / budget) * 100)) : 0;
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  const text = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <div>
      {showLabels && (
        <div className={`mb-1 flex items-center justify-between ${text} text-cloud/50`}>
          <span className="font-medium text-distro">{usdcCompact(paid)} paid</span>
          <span>{pct}% of {usdcCompact(budget)}</span>
        </div>
      )}
      <div
        className={`${height} w-full overflow-hidden rounded-full bg-panel-2`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reward pool paid out"
      >
        <div
          className="pool-fill h-full rounded-full"
          style={{ width: `${Math.max(pct, paid > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
