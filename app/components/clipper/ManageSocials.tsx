"use client";

import { useState } from "react";
import {
  useMyAccount,
  useClipperProfile,
  useConnectChannelStart,
  useConnectChannelVerify,
  useDisconnectChannel,
} from "@/lib/api/hooks";
import type { ConnectedChannel } from "@/lib/api/types";
import { Modal } from "@/components/Modal";
import { StateBlock, Spinner } from "@/components/StateBlock";
import { IconArrowUpRight, IconCheck, IconCopy, IconTrash, IconX } from "@/components/icons";
import {
  YouTubeLogo,
  XLogo,
  TikTokLogo,
  InstagramLogo,
} from "@/components/create/platformIcons";

type Logo = (p: { size?: number; className?: string }) => React.ReactElement;

const PLATFORMS: {
  id: string;
  name: string;
  Logo: Logo;
  connectable: boolean;
}[] = [
  { id: "youtube", name: "YouTube", Logo: YouTubeLogo, connectable: true },
  { id: "x", name: "X", Logo: XLogo, connectable: false },
  { id: "tiktok", name: "TikTok", Logo: TikTokLogo, connectable: false },
  { id: "instagram", name: "Instagram", Logo: InstagramLogo, connectable: false },
];

const LOGOS: Record<string, Logo> = {
  youtube: YouTubeLogo,
  x: XLogo,
  tiktok: TikTokLogo,
  instagram: InstagramLogo,
};

const field =
  "w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-sm text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25";

export function ManageSocials() {
  const { data: account, isLoading: accountLoading } = useMyAccount();
  const { data: profile, isLoading: profileLoading } = useClipperProfile();
  const disconnect = useDisconnectChannel();
  // Which platform's connect modal is open. `null` = closed.
  const [adding, setAdding] = useState<string | null>(null);
  // Platform id whose "coming soon" hint is briefly showing.
  const [soon, setSoon] = useState<string | null>(null);

  const channels = profile?.channels ?? [];

  function pick(id: string, connectable: boolean) {
    if (connectable) {
      setAdding(id);
      return;
    }
    setSoon(id);
    setTimeout(() => setSoon((cur) => (cur === id ? null : cur)), 1800);
  }

  if (account && account.type !== "clipper") {
    return (
      <StateBlock
        title="Clippers only"
        description="Switch to a clipper account to connect your social channels."
      />
    );
  }

  if (accountLoading || profileLoading) {
    return (
      <div className="flex justify-center py-16 text-cloud/40">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="font-display text-2xl font-bold text-cloud">Manage socials</h1>
        <p className="mt-1 text-sm text-cloud/50">
          Connect the channels you post clips from. Add as many as you like.
        </p>
      </header>

      {/* Platform selector — on top. Pick one to open its connect modal. */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-cloud/40">
          Add a channel
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLATFORMS.map(({ id, name, Logo, connectable }) => (
            <button
              key={id}
              onClick={() => pick(id, connectable)}
              className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-panel px-4 py-7 text-cloud transition hover:border-distro/40 hover:bg-panel-2"
            >
              <Logo size={32} />
              <span className="text-sm font-semibold">{name}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors ${
                  soon === id ? "text-amber-400" : "text-distro"
                }`}
              >
                {soon === id ? "Coming soon" : "Connect"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Verified channels across every platform */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-cloud/40">
          Your channels{channels.length > 0 ? ` · ${channels.length}` : ""}
        </h2>

        {channels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hairline bg-panel/40 px-4 py-12 text-center text-sm text-cloud/45">
            No channels connected yet. Pick a platform above to add one.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {channels.map((ch) => (
              <ConnectedRow
                key={ch.channelId}
                channel={ch}
                removing={disconnect.isPending && disconnect.variables === ch.channelId}
                onRemove={() => disconnect.mutate(ch.channelId)}
              />
            ))}
          </ul>
        )}
        {disconnect.error && (
          <p className="text-sm text-red-300">
            {disconnect.error instanceof Error
              ? disconnect.error.message
              : "Couldn't remove that channel"}
          </p>
        )}
      </section>

      <AddChannelModal
        platformId={adding}
        onClose={() => setAdding(null)}
      />
    </div>
  );
}

/** Connect-by-bio-code flow in a modal for a single platform (YouTube today). */
function AddChannelModal({
  platformId,
  onClose,
}: {
  platformId: string | null;
  onClose: () => void;
}) {
  const start = useConnectChannelStart();
  const verify = useConnectChannelVerify();
  const [channelUrl, setChannelUrl] = useState("");

  const Logo = platformId ? LOGOS[platformId] ?? YouTubeLogo : YouTubeLogo;
  const name = PLATFORMS.find((p) => p.id === platformId)?.name ?? "Channel";
  // Only show a code once it's been generated for the URL entered this session —
  // never resurface a stale `pendingCode` left on the profile from before.
  const code = start.data?.code ?? null;
  const error = start.error ?? verify.error ?? null;

  // Clear the input + pending code, but keep verify state so the success
  // message survives. Used after a channel is verified.
  function clearForm() {
    setChannelUrl("");
    start.reset();
  }

  // Full reset including the success banner — used when closing or starting over.
  function resetAll() {
    clearForm();
    verify.reset();
  }

  function close() {
    resetAll();
    onClose();
  }

  return (
    <Modal
      open={platformId !== null}
      onDismiss={close}
      overlayClassName="z-[65]"
      panelClassName="w-full max-w-md rounded-2xl border border-hairline bg-panel p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={22} />
          <div>
            <h2 className="font-display text-lg font-bold text-cloud">Connect {name}</h2>
            <p className="mt-0.5 text-sm text-cloud/50">
              Prove ownership by adding a code to your channel description.
            </p>
          </div>
        </div>
        <button
          onClick={close}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cloud/60 hover:bg-panel-2 hover:text-cloud"
          aria-label="Close"
        >
          <IconX size={18} />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <input
          className={field}
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          placeholder="https://youtube.com/@yourchannel"
        />

        {!code ? (
          <button
            onClick={() => {
              verify.reset();
              start.mutate(channelUrl);
            }}
            disabled={!channelUrl.trim() || start.isPending}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm font-semibold text-cloud transition hover:border-white/20 hover:bg-panel-2 disabled:opacity-50"
          >
            {start.isPending ? "Generating code…" : "Get verification code"}
          </button>
        ) : (
          <div className="space-y-2 rounded-lg border border-hairline bg-panel-2 p-3">
            <p className="text-xs text-cloud/50">
              Paste this anywhere in your channel description, then verify:
            </p>
            <div className="flex items-center gap-2 rounded bg-ink px-3 py-2">
              <code className="min-w-0 flex-1 select-all break-all font-mono text-sm text-distro">
                {code}
              </code>
              <CopyButton value={code} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetAll}
                className="rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-cloud/70 transition hover:bg-panel"
              >
                Use another URL
              </button>
              <button
                onClick={() => verify.mutate(undefined, { onSuccess: clearForm })}
                disabled={verify.isPending}
                className="flex-1 rounded-lg bg-distro px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-50"
              >
                {verify.isPending ? "Checking…" : "I've added it — verify"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-300">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        )}

        {verify.isSuccess && !code && (
          <div className="flex items-start gap-2 rounded-lg border border-distro/30 bg-distro/10 p-3 text-sm text-distro">
            <IconCheck size={16} className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-semibold">Channel connected.</strong> Saved and shown in
              your channels below — add another above or close.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — the code is select-all'able as a fallback */
    }
  }

  return (
    <button
      onClick={copy}
      className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
        copied ? "text-distro" : "text-cloud/55 hover:bg-panel-2 hover:text-cloud"
      }`}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** External URL to the channel on its platform (YouTube today). */
function channelUrl(ch: ConnectedChannel): string {
  const handle = ch.handle
    ? ch.handle.startsWith("@")
      ? ch.handle
      : `@${ch.handle}`
    : null;
  return handle
    ? `https://www.youtube.com/${handle}`
    : `https://www.youtube.com/channel/${ch.channelId}`;
}

function ConnectedRow({
  channel,
  removing,
  onRemove,
}: {
  channel: ConnectedChannel;
  removing: boolean;
  onRemove: () => void;
}) {
  const name = channel.title ?? channel.handle ?? channel.channelId;
  const username = channel.handle
    ? channel.handle.startsWith("@")
      ? channel.handle
      : `@${channel.handle}`
    : null;
  const Logo = LOGOS[channel.platform] ?? YouTubeLogo;

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-hairline bg-panel px-3 py-2.5 transition-colors hover:border-white/15">
      <a
        href={channelUrl(channel)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative shrink-0">
          {channel.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.thumbnailUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink">
              <Logo size={18} />
            </span>
          )}
          <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-panel ring-2 ring-panel">
            <Logo size={11} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-cloud">
            <span className="truncate">{name}</span>
            <IconArrowUpRight
              size={13}
              className="shrink-0 text-cloud/30 transition-colors group-hover:text-cloud/70"
            />
          </p>
          {username && <p className="truncate text-xs text-cloud/45">{username}</p>}
        </div>
      </a>

      <button
        onClick={onRemove}
        disabled={removing}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cloud/40 transition hover:bg-panel-2 hover:text-red-300 disabled:opacity-50"
        aria-label={`Remove ${name}`}
        title={removing ? "Removing…" : "Remove channel"}
      >
        <IconTrash size={15} />
      </button>
    </li>
  );
}
