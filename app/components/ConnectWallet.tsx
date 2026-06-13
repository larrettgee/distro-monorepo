"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { isAddress, parseUnits } from "viem";
import { arcTestnet } from "@/lib/chains";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ConnectWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address: wagmiAddress, chainId } = useAccount();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // Make the Privy wallet the active wagmi account so balance/send work.
  useEffect(() => {
    if (authenticated && !wagmiAddress && wallets.length > 0) {
      void setActiveWallet(wallets[0]);
    }
  }, [authenticated, wagmiAddress, wallets, setActiveWallet]);

  const address = wagmiAddress ?? (user?.wallet?.address as `0x${string}` | undefined);

  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const {
    data: hash,
    sendTransaction,
    isPending,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Refresh balance and clear the form after a confirmed send.
  useEffect(() => {
    if (isSuccess) {
      void refetchBalance();
      setAmount("");
      setTo("");
    }
  }, [isSuccess, refetchBalance]);

  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60";

  if (!ready) {
    return (
      <button disabled className={`${base} bg-panel-2 text-cloud/60`}>
        Loading…
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className={`${base} bg-distro text-ink hover:bg-mint active:scale-[0.98]`}
      >
        Sign in
      </button>
    );
  }

  const onArc = chainId === undefined || chainId === arcTestnet.id;
  const decimals = arcTestnet.nativeCurrency.decimals;

  let value: bigint | undefined;
  try {
    if (amount && Number(amount) > 0) value = parseUnits(amount, decimals);
  } catch {
    value = undefined;
  }
  const recipientValid = isAddress(to);
  const hasFunds = value !== undefined && balance !== undefined && value <= balance.value;
  const busy = isPending || isConfirming;
  const canSend =
    recipientValid && value !== undefined && value > BigInt(0) && hasFunds && onArc && !busy;

  const balanceLabel = balance
    ? `${Number(balance.formatted).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${balance.symbol}`
    : "…";
  const explorerTx = hash
    ? `${arcTestnet.blockExplorers.default.url}/tx/${hash}`
    : undefined;

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function onSend() {
    if (!canSend || value === undefined) return;
    resetSend();
    sendTransaction({ to: to as `0x${string}`, value });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${base} flex items-center gap-2 border border-hairline bg-panel text-cloud transition-colors hover:border-white/20`}
      >
        <span
          className={`h-2 w-2 rounded-full ${onArc ? "bg-distro" : "bg-amber-400"}`}
          aria-hidden
        />
        {address ? shortAddress(address) : "Account"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-hairline bg-panel p-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-cloud">
                <span
                  className={`h-2 w-2 rounded-full ${onArc ? "bg-distro" : "bg-amber-400"}`}
                  aria-hidden
                />
                {onArc ? "Arc Testnet" : "Wrong network"}
              </span>
              <button
                onClick={copyAddress}
                className="rounded-md px-2 py-1 font-mono text-xs text-cloud/70 transition-colors hover:bg-panel-2"
                title="Copy address"
              >
                {address ? shortAddress(address) : "—"} · {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-panel-2 px-4 py-3">
              <p className="text-xs text-cloud/50">Balance</p>
              <p className="font-display text-2xl font-bold text-distro">{balanceLabel}</p>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-cloud/50">Send {balance?.symbol ?? "USDC"}</p>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipient address (0x…)"
                spellCheck={false}
                className="w-full rounded-lg border border-hairline bg-ink px-3 py-2 font-mono text-xs text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25"
              />
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-sm text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25"
              />

              <button
                onClick={onSend}
                disabled={!canSend}
                className="w-full rounded-lg bg-distro px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-50"
              >
                {isPending ? "Confirm in wallet…" : isConfirming ? "Sending…" : "Send"}
              </button>

              {to.length > 0 && !recipientValid && (
                <p className="text-xs text-amber-300">Enter a valid address.</p>
              )}
              {value !== undefined && balance !== undefined && !hasFunds && (
                <p className="text-xs text-amber-300">Amount exceeds balance.</p>
              )}
              {isSuccess && explorerTx && (
                <a
                  href={explorerTx}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-distro underline"
                >
                  Sent ✓ — view on Arcscan
                </a>
              )}
              {sendError && (
                <p className="text-xs text-red-300">
                  {sendError.message.split("\n")[0].slice(0, 100)}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-4 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-cloud/70 transition-colors hover:border-amber-400/50 hover:text-amber-200"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
