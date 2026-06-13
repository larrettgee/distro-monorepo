const steps = [
  {
    n: "01",
    title: "Connect & pick a campaign",
    body: "Connect your wallet on Arc Testnet and browse funded reward pools from onchain projects.",
  },
  {
    n: "02",
    title: "Clip & post everywhere",
    body: "Cut the best moments and publish across X, TikTok, YouTube and Farcaster. Reach is the product.",
  },
  {
    n: "03",
    title: "Get paid in USDC",
    body: "Verified views convert to USDC at the campaign rate and settle instantly on Arc.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-14">
      <h2 className="font-display text-3xl font-bold text-cloud">How it works</h2>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-hairline bg-panel p-6">
            <span className="font-display text-2xl font-bold text-network">{s.n}</span>
            <h3 className="mt-3 font-display text-lg font-bold text-cloud">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-cloud/70">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
