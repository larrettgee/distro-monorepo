"use client";

import { useCallback, useEffect, useState } from "react";
import type { SVGProps } from "react";
import { Logo } from "@/components/Logo";
import { ArcMark } from "@/components/ArcMark";
import {
  IconChevronLeft,
  IconChevronRight,
  IconArrowUpRight,
} from "@/components/icons";

/* ── Pitch-only icons (kept local so the shared icon set stays lean) ──────── */

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
type IconProps = { className?: string; size?: number };
function Svg({ className, size, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg {...base} width={size ?? 24} height={size ?? 24} className={className} aria-hidden>
      {children}
    </svg>
  );
}

/** Bot / fake-account farm. */
const IconBot = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="11" rx="2.5" />
    <path d="M12 4v4M8 13h.01M16 13h.01M9 16.5h6" />
    <path d="M2.5 12v2M21.5 12v2" />
  </Svg>
);
/** Slow / expensive transfer. */
const IconHourglass = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12M6 21h12" />
    <path d="M7 3c0 5 5 6.5 5 9s-5 4-5 9M17 3c0 5-5 6.5-5 9s5 4 5 9" />
  </Svg>
);
/** Idle / locked-up money. */
const IconVaultLocked = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9v-.01M12 12l1.8 1.8" />
  </Svg>
);
/** Proof of personhood / WorldID. */
const IconGlobeId = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </Svg>
);
/** Fast crypto rails. */
const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Svg>
);
/** USDC that earns. */
const IconCoin = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.2c0-1.2 1.1-1.9 2.5-1.9s2.5.7 2.5 1.8M14.5 14.8c0 1.2-1.1 1.9-2.5 1.9s-2.5-.7-2.5-1.8" />
  </Svg>
);

/* ── Slide content ───────────────────────────────────────────────────────── */

const steps = [
  ["Brands fund a pool", "A brand puts USDC in a pool and drops in the content they want clipped."],
  ["Clippers cut it up", "Clippers turn it into short videos for YouTube, TikTok, and X."],
  ["Reach gets paid", "Every thousand real views pays out from the pool, in USDC."],
];

const problems = [
  {
    Icon: IconBot,
    title: "Bot farms fake the views",
    body: "Banned botting farms run up fake numbers, and they are hard to catch.",
  },
  {
    Icon: IconHourglass,
    title: "Payouts are slow",
    body: "Money moves through banks, so paying clippers is slow and costs a lot.",
  },
  {
    Icon: IconVaultLocked,
    title: "The money sits idle",
    body: "Cash locked up for bounties just sits there and earns nothing.",
  },
];

const fixes = [
  {
    Icon: IconGlobeId,
    title: "WorldID checks every payout",
    body: "People prove they are real before they get paid, so bot farms cannot cash out.",
  },
  {
    Icon: IconBolt,
    title: "Payouts run on crypto",
    body: "We pay in USDC instead of bank transfers. It is fast and nearly free.",
  },
  {
    Icon: IconCoin,
    title: "Escrowed USDC earns",
    body: "The money waiting in escrow can earn yield, which opens up new ways to run the business.",
  },
];

/* ── Slide chrome ────────────────────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wider text-distro">{children}</span>
  );
}

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 sm:px-14 lg:px-24">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}

const slides: React.ReactNode[] = [
  // 1 - Cover
  <Slide key="cover">
    <div className="flex flex-col items-center text-center">
      <Logo size={104} />
      <h1 className="mt-8 font-display text-6xl font-bold tracking-tight text-cloud sm:text-7xl">
        distro
      </h1>
      <p className="mt-5 font-display text-base font-medium uppercase tracking-[0.3em] text-distro sm:text-lg">
        Distribution is everything.
      </p>
      <p className="mt-8 inline-flex items-center gap-2 text-sm text-cloud/55">
        <ArcMark size={14} /> Live on Arc Testnet · ETH Global 2026
      </p>
    </div>
  </Slide>,

  // 2 - Meet Distro
  <Slide key="meet">
    <Eyebrow>Meet Distro</Eyebrow>
    <h2 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-cloud sm:text-5xl">
      Distro fixes clipping marketplaces.
    </h2>
    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cloud/65">
      We use crypto to make them work the way they should. Brands and builders reach more people,
      and clippers actually get paid for the views they bring in.
    </p>
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {steps.map(([title, body], i) => (
        <div key={title} className="rounded-2xl border border-hairline bg-panel p-5">
          <span className="font-display text-sm font-bold text-distro">0{i + 1}</span>
          <p className="mt-2 text-sm font-semibold text-cloud">{title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-cloud/55">{body}</p>
        </div>
      ))}
    </div>
  </Slide>,

  // 3 - The market
  <Slide key="market">
    <Eyebrow>The market</Eyebrow>
    <h2 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-cloud sm:text-5xl">
      A big market with real problems.
    </h2>
    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-stretch">
      <div className="rounded-2xl border border-hairline bg-panel p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-cloud/40">
          What is a clipping marketplace?
        </p>
        <p className="mt-3 text-base leading-relaxed text-cloud/70">
          A business or creator drops in raw content, like a four hour podcast, and puts a bounty
          on views. Say{" "}
          <span className="font-semibold text-cloud">$10,000 in payouts at $2 per 1,000 views</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["4-hour drops", "$2 / 1K views", "$10K bounties"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-hairline bg-panel-2 px-3 py-1 text-xs font-medium text-cloud/70"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center rounded-2xl border border-hairline bg-panel p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-cloud/45">A year in revenue</p>
        <p className="mt-2 font-display text-7xl font-bold tracking-tight text-distro">$4B</p>
        <p className="mt-3 text-sm text-cloud/55">And a lot of it is broken.</p>
      </div>
    </div>
  </Slide>,

  // 4 - Problems
  <Slide key="problems">
    <Eyebrow>The problems</Eyebrow>
    <h2 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-cloud sm:text-5xl">
      Three things hold it back.
    </h2>
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {problems.map(({ Icon, title, body }) => (
        <div key={title} className="rounded-2xl border border-hairline bg-panel p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-panel-2 text-cloud/70">
            <Icon size={22} />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-cloud">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-cloud/55">{body}</p>
        </div>
      ))}
    </div>
  </Slide>,

  // 5 - Fixes
  <Slide key="fixes">
    <Eyebrow>What we do</Eyebrow>
    <h2 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-cloud sm:text-5xl">
      Crypto fixes all three.
    </h2>
    <div className="mt-8 space-y-3.5">
      {fixes.map(({ Icon, title, body }) => (
        <div
          key={title}
          className="flex items-start gap-4 rounded-2xl border border-hairline bg-panel p-5"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-panel-2 text-distro">
            <Icon size={22} />
          </span>
          <div>
            <p className="font-display text-base font-bold text-cloud">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-cloud/55">{body}</p>
          </div>
        </div>
      ))}
    </div>
  </Slide>,

  // 6 - Close
  <Slide key="close">
    <div className="flex flex-col items-center text-center">
      <Logo size={68} />
      <h2 className="mt-7 font-display text-5xl font-bold tracking-tight text-cloud sm:text-6xl">
        Distribution is everything.
      </h2>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-cloud/60">
        An onchain clipping marketplace where real people get paid for real reach. It is live on
        Arc Testnet today.
      </p>
      <a
        href="/"
        className="mt-9 inline-flex h-11 items-center gap-2 rounded-lg bg-distro px-5 text-sm font-semibold text-ink transition hover:bg-network"
      >
        Open the marketplace
        <IconArrowUpRight size={16} />
      </a>
    </div>
  </Slide>,
];

/* ── Deck shell: keyboard + click navigation ─────────────────────────────── */

export function Deck() {
  const [i, setI] = useState(0);
  const last = slides.length - 1;

  const go = useCallback((idx: number) => setI(Math.min(last, Math.max(0, idx))), [last]);
  const prev = useCallback(() => setI((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setI((c) => Math.min(last, c + 1)), [last]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        setI(0);
      } else if (e.key === "End") {
        setI(last);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, last]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-cloud">
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 z-20 h-0.5 bg-hairline">
        <div
          className="h-full bg-distro transition-[width] duration-500 ease-out"
          style={{ width: `${(i / last) * 100}%` }}
        />
      </div>

      {/* Slides */}
      <div className="relative z-10 h-full">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            aria-hidden={idx !== i}
            className={`absolute inset-0 transition-opacity duration-300 ease-out ${
              idx === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-distro" : "w-1.5 bg-cloud/25 hover:bg-cloud/50"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-display text-xs tabular-nums text-cloud/45">
            {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prev}
              disabled={i === 0}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-panel text-cloud transition hover:bg-panel-2 disabled:opacity-30"
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              disabled={i === last}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-panel text-cloud transition hover:bg-panel-2 disabled:opacity-30"
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
