"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { arcTestnet } from "@/lib/chains";

/**
 * Campaign CTA. Walks the user through the funnel:
 *   not signed in → open Privy (email / social / wallet)
 *   wrong network → switch to Arc
 *   ready         → enter the campaign (mocked)
 */
export function ClipButton({ project }: { project: string }) {
  const { ready, authenticated, login } = usePrivy();
  const { chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const base = "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors";

  if (!authenticated) {
    return (
      <button
        onClick={login}
        disabled={!ready}
        className={`${base} bg-distro text-ink hover:bg-mint disabled:opacity-60`}
      >
        Connect to clip
      </button>
    );
  }

  // chainId is undefined for a beat while the wallet syncs; only flag a real mismatch.
  if (chainId !== undefined && chainId !== arcTestnet.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: arcTestnet.id })}
        disabled={isPending}
        className={`${base} bg-amber-300 text-ink hover:opacity-90 disabled:opacity-50`}
      >
        {isPending ? "Switching…" : "Switch to Arc"}
      </button>
    );
  }

  return (
    <button
      onClick={() => alert(`Joining "${project}" — submission flow coming soon.`)}
      className={`${base} bg-distro text-ink hover:bg-mint`}
    >
      Start clipping
    </button>
  );
}
