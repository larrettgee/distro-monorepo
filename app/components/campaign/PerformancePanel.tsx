"use client";

import { useCampaignPerformance, useSubmissions } from "@/lib/api/hooks";
import { usdc } from "@/lib/campaigns";
import { SubmissionsList } from "./SubmissionsList";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-panel px-4 py-3">
      <p className="text-xs text-cloud/50">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-cloud">{value}</p>
    </div>
  );
}

export function PerformancePanel({ campaignId }: { campaignId: string }) {
  const { data: perf, isLoading } = useCampaignPerformance(campaignId);
  const { data: submissions } = useSubmissions(campaignId);

  const fmt = (n: number | null | undefined) => (n == null ? "—" : usdc(n));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-cloud">Performance</h2>
        {isLoading ? (
          <p className="text-sm text-cloud/50">Loading on-chain data…</p>
        ) : !perf || perf.budgetUsdc == null ? (
          <p className="text-sm text-cloud/50">
            Not funded on-chain yet — confirm the campaign to see live numbers.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Budget" value={fmt(perf.budgetUsdc)} />
            <Stat label="Allocated" value={fmt(perf.allocatedUsdc)} />
            <Stat label="Remaining" value={fmt(perf.remainingUsdc)} />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-cloud">
          Submissions{submissions ? ` (${submissions.length})` : ""}
        </h2>
        <SubmissionsList submissions={submissions ?? []} />
      </section>
    </div>
  );
}
