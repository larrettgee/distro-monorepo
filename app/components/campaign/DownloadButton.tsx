"use client";

import { useState } from "react";
import { IconDownload } from "@/components/icons";

type Prepared = { ready: boolean; url?: string; percentComplete?: number | null };

/**
 * Downloads a campaign's Cloudflare Stream source as MP4. Stream MP4s must be
 * enabled before the `.../downloads/default.mp4` URL exists, so we POST to our
 * server route (which enables + reports status) to get a working URL — no
 * dependence on the public customer-subdomain env. If the encode isn't ready we
 * poll briefly, then hand off to the browser.
 */
export function DownloadButton({ uid }: { uid: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function prepare(): Promise<Prepared> {
    const res = await fetch(`/api/stream/${uid}/download`, { method: "POST" });
    if (!res.ok) throw new Error("Couldn't prepare the download.");
    return (await res.json()) as Prepared;
  }

  async function download() {
    setBusy(true);
    setError(null);
    try {
      let prepared = await prepare();
      // Poll while Cloudflare finishes the MP4 encode (a few attempts, ~12s).
      for (let i = 0; i < 6 && !prepared.ready; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        prepared = await prepare();
      }
      if (!prepared.url) throw new Error("Download isn't ready yet — try again shortly.");

      const a = document.createElement("a");
      a.href = prepared.url;
      a.rel = "noopener";
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-300">{error}</span>}
      <button
        onClick={download}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-cloud/80 transition hover:border-white/25 hover:text-cloud disabled:opacity-60"
      >
        <IconDownload size={15} />
        {busy ? "Preparing…" : "Download"}
      </button>
    </div>
  );
}
