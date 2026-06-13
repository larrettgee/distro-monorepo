"use client";

import { useState } from "react";
import { useMyAccount, useClipperProfile, useSubmitVideos, useSubmissions } from "@/lib/api/hooks";
import { useClipperConnect } from "@/components/clipper/ClipperConnectProvider";
import { SubmissionsList } from "./SubmissionsList";
import { IconCheck } from "@/components/icons";

export function SubmitPanel({ campaignId }: { campaignId: string }) {
  const { data: account } = useMyAccount();
  const { data: profile } = useClipperProfile();
  const { openConnect } = useClipperConnect();
  const submit = useSubmitVideos(campaignId);
  const { data: submissions } = useSubmissions(campaignId);
  const [text, setText] = useState("");

  const verified = account?.verificationStatus === "verified";
  const connected = profile?.connected;

  const urls = text
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-cloud">Submit clips</h2>

        {!connected ? (
          <div className="rounded-xl border border-hairline bg-panel p-4">
            <p className="text-sm text-cloud/70">Connect your YouTube channel to submit clips.</p>
            <button
              onClick={openConnect}
              className="mt-3 rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
            >
              Connect YouTube
            </button>
          </div>
        ) : !verified ? (
          <div className="rounded-xl border border-hairline bg-panel p-4 text-sm text-cloud/70">
            Verify with World ID before you can submit clips. You can browse and connect your
            channel in the meantime.
          </div>
        ) : (
          <div className="rounded-xl border border-hairline bg-panel p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Paste YouTube video URLs, one per line…"}
              className="min-h-24 w-full resize-none rounded-lg border border-hairline bg-ink px-3 py-2 font-mono text-xs text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-cloud/45">
                {urls.length} URL{urls.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={() => submit.mutate(urls)}
                disabled={urls.length === 0 || submit.isPending}
                className="rounded-lg bg-distro px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-50"
              >
                {submit.isPending ? "Submitting…" : "Submit"}
              </button>
            </div>

            {submit.data && (
              <div className="mt-3 space-y-1.5 text-xs">
                {submit.data.accepted.length > 0 && (
                  <p className="flex items-center gap-1.5 text-distro">
                    <IconCheck size={13} /> {submit.data.accepted.length} accepted
                  </p>
                )}
                {submit.data.rejected.map((r) => (
                  <p key={r.url} className="text-red-300">
                    Rejected: {r.url} — {r.reason}
                  </p>
                ))}
              </div>
            )}
            {submit.error && (
              <p className="mt-3 text-xs text-red-300">
                {submit.error instanceof Error ? submit.error.message : "Submission failed"}
              </p>
            )}
          </div>
        )}
      </section>

      {submissions && submissions.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-cloud">Your submissions</h2>
          <SubmissionsList submissions={submissions} />
        </section>
      )}
    </div>
  );
}
