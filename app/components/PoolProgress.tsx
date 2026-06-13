import { usdcCompact } from "@/lib/campaigns";

/**
 * Fun little reward-pool loading bar — animated candy stripes drift across the
 * filled portion. Used on cards, the campaign view, and dashboards so payout
 * progress reads the same everywhere.
 *
 * When `allocated` is provided, the track shows two tones: a muted layer for
 * funds committed to submissions (allocated) and the bright striped fill for
 * what's actually been paid out on top.
 */
export function PoolProgress({
  paid,
  budget,
  allocated,
  size = "md",
  showLabels = true,
}: {
  paid: number;
  budget: number;
  allocated?: number | null;
  size?: "sm" | "md";
  showLabels?: boolean;
}) {
  const pct = budget > 0 ? Math.min(100, Math.round((paid / budget) * 100)) : 0;
  const hasAlloc = allocated != null && budget > 0;
  const alloc = allocated ?? 0;
  const allocPct = hasAlloc ? Math.min(100, Math.round((alloc / budget) * 100)) : 0;
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  const text = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <div>
      {showLabels && (
        <div className={`mb-1 flex items-center justify-between ${text} text-cloud/50`}>
          <span className="font-medium text-distro">{usdcCompact(paid)} paid</span>
          {hasAlloc && (
            <span className="text-cloud/40">{usdcCompact(alloc)} allocated</span>
          )}
          <span>{pct}% of {usdcCompact(budget)}</span>
        </div>
      )}
      <div
        className={`relative ${height} w-full overflow-hidden rounded-full bg-panel-2`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reward pool paid out"
      >
        {hasAlloc && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-distro/25"
            style={{ width: `${Math.max(allocPct, alloc > 0 ? 4 : 0)}%` }}
          />
        )}
        <div
          className="pool-fill absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${Math.max(pct, paid > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
