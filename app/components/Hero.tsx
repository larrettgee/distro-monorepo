"use client";

import { useEffect, useState } from "react";
import type { Campaign } from "@/lib/campaigns";
import { usdcCompact } from "@/lib/campaigns";
import { CreateButton } from "./CreateButton";
import { ArcMark } from "./ArcMark";
import { IconArrowUpRight, IconUpload, IconFilm, IconTrending, IconX } from "./icons";

const DISMISS_KEY = "distro:hero-dismissed";

const steps = [
  {
    Icon: IconUpload,
    title: "Brands fund a pool",
    body: "Brands lock USDC into an onchain reward pool and upload the source content to clip.",
  },
  {
    Icon: IconFilm,
    title: "Clippers cut it up",
    body: "Clippers turn those drops into shorts for YouTube, TikTok, X and more.",
  },
  {
    Icon: IconTrending,
    title: "Reach gets paid",
    body: "Every thousand verified views pays out from the pool, automatically in USDC.",
  },
];

/**
 * Welcoming intro for the marketplace landing — explains what Distro is and how
 * it works, then points people straight at the two things they can do. It's
 * dismissible; the choice persists in localStorage and can be reopened.
 */
export function Hero({ items }: { items: Campaign[] }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  function hide() {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  function show() {
    setDismissed(false);
    localStorage.removeItem(DISMISS_KEY);
  }

  if (dismissed) {
    return (
      <button
        onClick={show}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-cloud/55 transition hover:text-cloud"
      >
        How Distro works
        <IconArrowUpRight size={15} />
      </button>
    );
  }

  const openPools = items.reduce((sum, c) => sum + c.rewardPool, 0);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-hairline bg-panel">
      <button
        onClick={hide}
        aria-label="Hide intro"
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg text-cloud/40 transition hover:bg-panel-2 hover:text-cloud"
      >
        <IconX size={16} />
      </button>

      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-panel-2 px-3 py-1 text-xs font-medium text-cloud/60">
            <ArcMark size={14} />
            Live on Arc Testnet
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-cloud sm:text-4xl">
            Clip it. Spread it. Get paid.
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-cloud/60">
            Distro is the onchain clipping marketplace. Brands fund USDC reward pools, and clippers
            earn for every thousand views they drive — no contracts, no invoices, just reach that pays.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CreateButton variant="primary" className="h-10 px-4">
              Create a campaign
            </CreateButton>
            <a
              href="#explore"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-hairline px-4 text-sm font-semibold text-cloud transition hover:border-white/20 hover:bg-panel-2"
            >
              Browse campaigns
              <IconArrowUpRight size={16} />
            </a>
          </div>

          {items.length > 0 && (
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-hairline pt-5">
              <div>
                <dt className="text-xs text-cloud/45">In reward pools</dt>
                <dd className="mt-0.5 font-display text-lg font-bold text-distro">
                  {usdcCompact(openPools)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-cloud/45">Open campaigns</dt>
                <dd className="mt-0.5 font-display text-lg font-bold text-cloud">{items.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-cloud/45">Paid out</dt>
                <dd className="mt-0.5 font-display text-lg font-bold text-cloud">Instantly, in USDC</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="lg:border-l lg:border-hairline lg:pl-10">
          <p className="text-xs font-medium uppercase tracking-wider text-cloud/40">How it works</p>
          <ol className="mt-4 space-y-4">
            {steps.map(({ Icon, title, body }, i) => (
              <li key={title} className="flex gap-3.5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel-2 text-distro">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-cloud">
                    <span className="text-cloud/40">{i + 1}.</span> {title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-cloud/55">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
