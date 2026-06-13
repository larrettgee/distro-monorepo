import { Navbar } from "@/components/Navbar";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { CampaignCard } from "@/components/CampaignCard";
import { campaigns } from "@/lib/campaigns";

export default function Home() {
  return (
    <>
      <Navbar />
      <NetworkGuard />

      <main className="flex-1">
        <Hero />
        <Stats />

        <section id="campaigns" className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold text-cloud">Open campaigns</h2>
            <span className="text-sm text-cloud/50">{campaigns.length} funded pools</span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}
