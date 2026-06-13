import { marketStats, usdc } from "@/lib/campaigns";

const items = [
  { label: "Paid to clippers", value: usdc(marketStats.totalPaidOut) },
  { label: "Active campaigns", value: marketStats.activeCampaigns.toString() },
  { label: "Clippers earning", value: marketStats.clippers.toLocaleString("en-US") },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((s) => (
          <div key={s.label} className="rounded-2xl border border-hairline bg-panel px-5 py-4">
            <dt className="text-sm text-cloud/60">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-bold text-distro">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
