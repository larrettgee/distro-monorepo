import type { Campaign as UiCampaign, Platform } from "@/lib/campaigns";
import { streamThumbnail, streamUid } from "@/lib/cloudflareStream";
import type { Campaign as ApiCampaign, CampaignStatus } from "./types";

const PLATFORM_MAP: Record<string, Platform> = {
  youtube: "YouTube",
  x: "X",
  twitter: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
  reels: "Reels",
};

function shortWallet(w: string) {
  return w.length > 12 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;
}

function statusLabel(s: CampaignStatus) {
  return s === "active" ? "Open" : s === "closed" ? "Closed" : "Pending";
}

/** Map an API campaign onto the card view-model. */
export function adaptCampaign(c: ApiCampaign): UiCampaign {
  const uid = streamUid(c.sourceContentUrl);
  return {
    id: c.id,
    brand: c.brandUsername || shortWallet(c.brandWallet),
    handle: `@${c.brandUsername}`,
    title: c.title,
    category: "Tech",
    image: uid ? streamThumbnail(uid, { width: 640 }) : `https://picsum.photos/seed/${c.id}/640/440`,
    platforms: c.platforms.map((p) => PLATFORM_MAP[p.toLowerCase()]).filter(Boolean) as Platform[],
    rewardPool: c.budgetUsdc,
    paidOut: 0,
    ratePer1k: c.ratePerThousandViews,
    timeLeft: statusLabel(c.status),
    clippers: 0,
    status: statusLabel(c.status),
  };
}
