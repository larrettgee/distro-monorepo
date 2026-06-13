import type { Submission } from "@/lib/api/types";

const STATUS_STYLE: Record<Submission["status"], string> = {
  pending: "bg-amber-400/10 text-amber-300",
  accepted: "bg-distro/15 text-distro",
  rejected: "bg-red-400/10 text-red-300",
};

export function SubmissionsList({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return <p className="text-sm text-cloud/50">No submissions yet.</p>;
  }

  return (
    <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
      {submissions.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-3 bg-panel p-3">
          <a
            href={s.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate font-mono text-xs text-cloud/80 underline-offset-2 hover:underline"
          >
            {s.videoUrl}
          </a>
          <span className="shrink-0 text-xs text-cloud/50">
            {s.lastViewCount != null ? `${s.lastViewCount.toLocaleString("en-US")} views` : "—"}
          </span>
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[s.status]}`}>
            {s.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
