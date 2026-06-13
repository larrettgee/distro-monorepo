"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { writeContract, waitForTransactionReceipt, switchChain, getAccount } from "@wagmi/core";
import { config as wagmiConfig } from "@/lib/wagmi";
import { arcTestnet } from "@/lib/chains";
import { distroEscrowAbi } from "@/lib/escrowAbi";
import { api } from "@/lib/api/client";
import { useCreateCampaign, useMyAccount } from "@/lib/api/hooks";
import { createCloudflareStreamDriver } from "@/lib/upload/cloudflareStreamDriver";
import { VideoUploader } from "@/components/upload/VideoUploader";
import type { UploadAsset } from "@/lib/upload/types";
import { IconX, IconCheck } from "@/components/icons";
import { YouTubeLogo, TikTokLogo, XLogo, InstagramLogo } from "./platformIcons";

const streamDriver = createCloudflareStreamDriver();

const PLATFORMS = [
  { id: "youtube", label: "YouTube", available: true, Logo: YouTubeLogo },
  { id: "tiktok", label: "TikTok", available: false, Logo: TikTokLogo },
  { id: "x", label: "X", available: false, Logo: XLogo },
  { id: "instagram", label: "Instagram", available: false, Logo: InstagramLogo },
] as const;

const RULE_PRESETS = [
  "No spoilers",
  "Keep it under 60 seconds",
  "Must tag the brand",
  "No misleading claims",
  "Original edits only (no reuploads)",
  "Family-friendly content",
];

type Phase = "form" | "creating" | "funding" | "confirming" | "activating" | "done";

export function CreateCampaignModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const { data: account } = useMyAccount();
  const createCampaign = useCreateCampaign();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [rate, setRate] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["youtube"]);
  const [rules, setRules] = useState<string[]>([]);
  const [customRules, setCustomRules] = useState("");
  const [asset, setAsset] = useState<UploadAsset | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);

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

  const isBrand = account?.type === "brand";
  const sourceContentUrl = asset ? (asset.url ?? `https://cloudflarestream.com/${asset.id}`) : "";
  const budgetNum = Number(budget);
  const rateNum = Number(rate);
  const canSubmit =
    isBrand &&
    title.trim() &&
    description.trim() &&
    budgetNum > 0 &&
    rateNum > 0 &&
    platforms.length > 0 &&
    !!asset &&
    phase === "form";

  const busyLabel: Record<Phase, string> = {
    form: "Create campaign",
    creating: "Saving campaign…",
    funding: "Confirm funding in wallet…",
    confirming: "Waiting for confirmation…",
    activating: "Activating campaign…",
    done: "Done",
  };

  function toggleRule(rule: string) {
    setRules((prev) => (prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]));
  }

  async function submit() {
    setError(null);
    try {
      if (getAccount(wagmiConfig).chainId !== arcTestnet.id) {
        setPhase("funding");
        await switchChain(wagmiConfig, { chainId: arcTestnet.id });
      }

      const systemRules = [...rules, customRules.trim()].filter(Boolean).join("\n");

      setPhase("creating");
      const { campaign, onchain } = await createCampaign.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        sourceContentUrl,
        systemRules: systemRules || undefined,
        budgetUsdc: budgetNum,
        ratePerThousandViews: rateNum,
        platforms,
      });

      setPhase("funding");
      const hash = await writeContract(wagmiConfig, {
        address: onchain.escrowAddress as `0x${string}`,
        abi: distroEscrowAbi,
        functionName: "createJobNative",
        args: [onchain.operator as `0x${string}`, BigInt(onchain.pricePerThousandViews)],
        value: BigInt(onchain.budget),
        chainId: arcTestnet.id,
      });

      setPhase("confirming");
      await waitForTransactionReceipt(wagmiConfig, { hash });

      setPhase("activating");
      await api.campaigns.confirm(campaign.id, hash, await getAccessToken());

      setPhase("done");
      setTimeout(onClose, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message.split("\n")[0] : "Something went wrong");
      setPhase("form");
    }
  }

  const field =
    "w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-sm text-cloud outline-none placeholder:text-cloud/30 focus:border-white/25";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={phase === "form" ? onClose : undefined} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-hairline bg-panel"
      >
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-cloud">Create campaign</h2>
            <p className="mt-0.5 text-sm text-cloud/50">
              Fund a bounty and upload your source content. Settles in USDC on Arc.
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

        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {ready && !authenticated ? (
            <button
              onClick={login}
              className="w-full rounded-lg bg-distro px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mint"
            >
              Sign in to create a campaign
            </button>
          ) : account && !isBrand ? (
            <p className="rounded-lg border border-hairline bg-panel-2 p-4 text-sm text-cloud/70">
              Only brand accounts can create campaigns.
            </p>
          ) : phase === "done" ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-distro/15 text-distro">
                <IconCheck size={26} />
              </span>
              <p className="font-display text-lg font-bold text-cloud">Campaign is live</p>
              <p className="text-sm text-cloud/55">Clippers can start submitting now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <Labeled label="Title">
                  <input
                    className={field}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Clip our launch keynote"
                  />
                </Labeled>
                <Labeled label="Description">
                  <textarea
                    className={`${field} min-h-24 resize-none`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What should clippers make, and what wins?"
                  />
                </Labeled>
                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Budget (USDC)">
                    <input
                      className={field}
                      inputMode="decimal"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="5000"
                    />
                  </Labeled>
                  <Labeled label="Rate / 1k views">
                    <input
                      className={field}
                      inputMode="decimal"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="3.50"
                    />
                  </Labeled>
                </div>

                <Labeled label="Platforms">
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((p) => {
                      const selected = platforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={!p.available}
                          onClick={() =>
                            setPlatforms((prev) =>
                              prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                            )
                          }
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            selected
                              ? "border-distro/60 bg-distro/10 text-cloud"
                              : p.available
                                ? "border-hairline text-cloud/80 hover:border-white/20"
                                : "cursor-not-allowed border-hairline text-cloud/35"
                          }`}
                        >
                          <p.Logo size={18} className={p.available ? undefined : "opacity-40"} />
                          <span className="flex-1 text-left">{p.label}</span>
                          {!p.available && <span className="text-[10px] text-cloud/35">Soon</span>}
                          {selected && <IconCheck size={14} className="text-distro" />}
                        </button>
                      );
                    })}
                  </div>
                </Labeled>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <Labeled label="System rules">
                  <div className="flex flex-wrap gap-1.5">
                    {RULE_PRESETS.map((r) => {
                      const on = rules.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRule(r)}
                          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            on
                              ? "border-distro/60 bg-distro/10 text-cloud"
                              : "border-hairline text-cloud/60 hover:border-white/20 hover:text-cloud"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    className={`${field} mt-2 min-h-16 resize-none`}
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    placeholder="Add custom notes (optional)…"
                  />
                </Labeled>

                <Labeled label="Source content">
                  {asset ? (
                    <div className="flex items-center justify-between rounded-lg border border-hairline bg-panel-2 p-3 text-sm text-cloud">
                      <span className="flex min-w-0 items-center gap-2 text-distro">
                        <IconCheck size={15} />
                        <span className="truncate">{asset.fileName}</span>
                      </span>
                      <button
                        onClick={() => setAsset(null)}
                        className="shrink-0 text-xs text-cloud/50 hover:text-cloud"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <VideoUploader
                      driver={streamDriver}
                      multiple={false}
                      onComplete={(assets) => assets[0] && setAsset(assets[0])}
                    />
                  )}
                </Labeled>
              </div>
            </div>
          )}
        </div>

        {isBrand && phase !== "done" && (
          <div className="border-t border-hairline p-5 pt-4">
            {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="w-full rounded-lg bg-distro px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98] disabled:opacity-50"
            >
              {busyLabel[phase]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-cloud/50">{label}</span>
      {children}
    </label>
  );
}
