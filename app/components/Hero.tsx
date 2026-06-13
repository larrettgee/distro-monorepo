export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 md:pt-24">
      <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel px-3 py-1 text-xs text-mint">
        <span className="h-1.5 w-1.5 rounded-full bg-distro" />
        Live on Arc Testnet · settled in USDC
      </span>

      <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-cloud md:text-6xl">
        Clip it. Spread it.{" "}
        <span className="text-distro">Get paid.</span>
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed text-cloud/70">
        The onchain clipping marketplace. Projects fund reward pools, clippers turn
        them into reach across every platform, and payouts settle instantly in USDC.
        Distribution is everything.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#campaigns"
          className="rounded-xl bg-distro px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-mint"
        >
          Browse campaigns
        </a>
        <a
          href="#how"
          className="rounded-xl border border-hairline px-5 py-3 text-sm font-semibold text-cloud transition-colors hover:border-network"
        >
          How it works
        </a>
      </div>
    </section>
  );
}
