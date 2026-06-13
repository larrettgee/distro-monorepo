"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { isAddress, parseUnits } from "viem";
import { arcTestnet } from "@/lib/chains";
import { ArcMark } from "@/components/ArcMark";
import { VerifyWorldId } from "@/components/VerifyWorldId";
import { IconCopy, IconCheck, IconLogout } from "@/components/icons";
import { useMyAccount } from "@/lib/api/hooks";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** World ID status worn on the account button: a shield, marked + colored by state. */
function VerifyMark({ status }: { status: "verified" | "unverified" }) {
  const verified = status === "verified";
  return (
    <span
      title={
        verified
          ? "World ID verified"
          : "Unverified — verify with World ID to unlock payouts"
      }
      aria-label={verified ? "World ID verified" : "Account unverified"}
      className={verified ? "text-distro" : "text-red-400"}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2 4 5v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V5l-8-3Z" />
        {verified ? (
          <path d="m9 12 2 2 4-4" />
        ) : (
          <>
            <line x1="12" y1="8" x2="12" y2="12.5" />
            <circle cx="12" cy="15.5" r="0.6" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </span>
  );
}

export function ConnectWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address: wagmiAddress, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: account } = useMyAccount();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [withdrawSoon, setWithdrawSoon] = useState(false);
  // Send-USDC logic is kept wired up below but no longer surfaced in the UI.
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // Keep the active wagmi account in sync with Privy's connected wallets so
  // balance/send work — and so a wallet left connected by a previous session
  // (e.g. an external wallet wagmi didn't disconnect on logout) can't linger as
  // the displayed address. Switch whenever the active wagmi address isn't one
  // of the wallets Privy currently has linked.
  useEffect(() => {
    if (!authenticated || wallets.length === 0) return;
    const inSync = wallets.some(
      (w) => w.address.toLowerCase() === wagmiAddress?.toLowerCase(),
    );
    if (!inSync) void setActiveWallet(wallets[0]);
  }, [authenticated, wagmiAddress, wallets, setActiveWallet]);

  // Prefer Privy's linked wallet as the source of truth; fall back to wagmi.
  const address =
    (wallets[0]?.address as `0x${string}` | undefined) ??
    wagmiAddress ??
    (user?.wallet?.address as `0x${string}` | undefined);

  // Tear down wagmi's connector alongside Privy so no external wallet survives
  // logout and reappears on the next sign-in.
  async function handleLogout() {
    setOpen(false);
    disconnect();
    await logout();
  }

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
    ? `$${Number(balance.formatted).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
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
        {onArc ? (
          <ArcMark size={16} />
        ) : (
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
        )}
        {account?.username ?? (address ? shortAddress(address) : "Account")}
        {account?.initialized && account.verificationStatus && (
          <VerifyMark status={account.verificationStatus} />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-hairline bg-panel p-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-cloud">
                {onArc ? (
                  <ArcMark size={16} />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                )}
                {onArc ? "Arc Testnet" : "Wrong network"}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-cloud/45">
                  {address ? shortAddress(address) : "—"}
                </span>
                <button
                  onClick={copyAddress}
                  className="grid h-7 w-7 place-items-center rounded-md text-cloud/50 transition-colors hover:bg-panel-2 hover:text-cloud"
                  title={copied ? "Copied" : "Copy address"}
                  aria-label="Copy address"
                >
                  {copied ? (
                    <IconCheck size={15} className="text-distro" />
                  ) : (
                    <IconCopy size={15} />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="grid h-7 w-7 place-items-center rounded-md text-cloud/50 transition-colors hover:bg-panel-2 hover:text-amber-200"
                  title="Disconnect"
                  aria-label="Disconnect"
                >
                  <IconLogout size={15} />
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-panel-2 px-4 py-3">
              <p className="text-xs text-cloud/50">Balance</p>
              <p className="font-display text-2xl font-bold text-distro">{balanceLabel}</p>
            </div>

            <button
              onClick={() => {
                setWithdrawSoon(true);
                setTimeout(() => setWithdrawSoon(false), 1600);
              }}
              className="mt-4 w-full rounded-lg bg-distro px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
            >
              {withdrawSoon ? "Coming soon" : "Withdraw to Bank"}
            </button>

            <VerifyWorldId />
          </div>
        </>
      )}
    </div>
  );
}
