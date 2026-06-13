"use client";

import { useEffect, useState } from "react";
import {
  useClipperProfile,
  useConnectChannelStart,
  useConnectChannelVerify,
} from "@/lib/api/hooks";
import { IconX, IconCheck } from "@/components/icons";

export function ClipperConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: profile } = useClipperProfile();
  const start = useConnectChannelStart();
  const verify = useConnectChannelVerify();
  const [channelUrl, setChannelUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const code = start.data?.code ?? profile?.pendingCode ?? null;
  const connected = profile?.connected;
  const field =
    "w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-sm text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25";

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-hairline bg-panel p-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-cloud">Connect YouTube</h2>
            <p className="mt-0.5 text-sm text-cloud/50">
              Prove you own the channel by adding a code to your channel description.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-cloud/60 hover:bg-panel-2 hover:text-cloud"
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        {connected ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-hairline bg-panel-2 p-4 text-sm text-distro">
            <IconCheck size={16} />
            Channel connected{profile?.youtubeHandle ? ` · ${profile.youtubeHandle}` : ""}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-cloud/50">Channel URL or @handle</span>
              <input
                className={field}
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </label>

            <button
              onClick={() => start.mutate(channelUrl)}
              disabled={!channelUrl.trim() || start.isPending}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm font-semibold text-cloud transition hover:border-white/20 hover:bg-panel-2 disabled:opacity-50"
            >
              {start.isPending ? "Generating code…" : code ? "Regenerate code" : "Get verification code"}
            </button>

            {code && (
              <div className="space-y-2 rounded-lg border border-hairline bg-panel-2 p-3">
                <p className="text-xs text-cloud/50">Paste this into your channel description:</p>
                <code className="block select-all break-all rounded bg-ink px-3 py-2 font-mono text-sm text-distro">
                  {code}
                </code>
                <button
                  onClick={() => verify.mutate()}
                  disabled={verify.isPending}
                  className="w-full rounded-lg bg-distro px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-50"
                >
                  {verify.isPending ? "Checking…" : "I've added it — verify"}
                </button>
              </div>
            )}

            {(start.error || verify.error) && (
              <p className="text-sm text-red-300">
                {(start.error ?? verify.error) instanceof Error
                  ? (start.error ?? verify.error)!.message
                  : "Something went wrong"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
