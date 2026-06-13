import type { Metadata } from "next";
import { Deck } from "@/components/pitch/Deck";

// Secret deck — kept out of search engines and the sitemap.
export const metadata: Metadata = {
  title: "Distro — Pitch",
  description: "Distribution is everything.",
  robots: { index: false, follow: false },
};

export default function PitchPage() {
  return <Deck />;
}
