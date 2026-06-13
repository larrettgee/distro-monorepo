"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/lib/chains";

/** Sticky banner shown when a wallet is connected to the wrong network. */
export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === arcTestnet.id) return null;

  return (
    <div className="border-b border-amber-400/30 bg-amber-400/10">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm md:px-6">
        <span className="text-amber-200">
          You&apos;re on the wrong network. Distro runs on Arc Testnet.
        </span>
        <button
          onClick={() => switchChain({ chainId: arcTestnet.id })}
          disabled={isPending}
          className="rounded-full bg-amber-300 px-4 py-1.5 text-xs font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Switching…" : "Switch to Arc Testnet"}
        </button>
      </div>
    </div>
  );
}
