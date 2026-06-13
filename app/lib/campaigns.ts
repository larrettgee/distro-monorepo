export type Platform = "X" | "TikTok" | "YouTube" | "Instagram" | "Reels";
export type Category =
  | "Sports"
  | "Music"
  | "Tech"
  | "Food"
  | "Entertainment"
  | "Beauty"
  | "Gaming";

export type Campaign = {
  id: string;
  brand: string;
  handle: string;
  title: string;
  category: Category;
  /** thumbnail photo */
  image: string;
  platforms: Platform[];
  /** USDC */
  rewardPool: number;
  paidOut: number;
  /** USDC per 1,000 verified views */
  ratePer1k: number;
  timeLeft: string;
  clippers: number;
  status: "Open" | "Ending soon";
};

const photo = (seed: string) => `https://picsum.photos/seed/${seed}/640/440`;

export const campaigns: Campaign[] = [
  {
    id: "nike-run",
    brand: "Nike",
    handle: "@nike",
    title: "Clip the best moments from our athletes' marathon runs",
    category: "Sports",
    image: photo("nike-run-track"),
    platforms: ["TikTok", "YouTube", "Reels"],
    rewardPool: 60305,
    paidOut: 18420,
    ratePer1k: 3.2,
    timeLeft: "5d 9h",
    clippers: 312,
    status: "Open",
  },
  {
    id: "redbull-stunts",
    brand: "Red Bull",
    handle: "@redbull",
    title: "Capture the wildest stunts and clutch moments",
    category: "Sports",
    image: photo("redbull-extreme-sky"),
    platforms: ["TikTok", "Instagram", "X"],
    rewardPool: 54295,
    paidOut: 31200,
    ratePer1k: 4.0,
    timeLeft: "27d 6h",
    clippers: 902,
    status: "Open",
  },
  {
    id: "spotify-wrapped",
    brand: "Spotify",
    handle: "@spotify",
    title: "Turn new releases into clips your group chat will share",
    category: "Music",
    image: photo("spotify-concert-lights"),
    platforms: ["TikTok", "Reels", "X"],
    rewardPool: 25127,
    paidOut: 11200,
    ratePer1k: 2.6,
    timeLeft: "27d 21h",
    clippers: 514,
    status: "Open",
  },
  {
    id: "netflix-scenes",
    brand: "Netflix",
    handle: "@netflix",
    title: "Clip the scenes everyone will be talking about Monday",
    category: "Entertainment",
    image: photo("netflix-cinema-screen"),
    platforms: ["TikTok", "YouTube"],
    rewardPool: 41800,
    paidOut: 22600,
    ratePer1k: 3.5,
    timeLeft: "2d 4h",
    clippers: 741,
    status: "Ending soon",
  },
  {
    id: "gopro-pov",
    brand: "GoPro",
    handle: "@gopro",
    title: "Best POV adventure footage of the month wins the pool",
    category: "Tech",
    image: photo("gopro-surf-pov"),
    platforms: ["YouTube", "Reels", "TikTok"],
    rewardPool: 21500,
    paidOut: 9050,
    ratePer1k: 2.8,
    timeLeft: "18d 6h",
    clippers: 145,
    status: "Open",
  },
  {
    id: "liquid-death-chaos",
    brand: "Liquid Death",
    handle: "@liquiddeath",
    title: "Most chaotic, most shareable brand clip takes it all",
    category: "Food",
    image: photo("liquiddeath-skate-grit"),
    platforms: ["TikTok", "Instagram"],
    rewardPool: 33640,
    paidOut: 14800,
    ratePer1k: 4.4,
    timeLeft: "9d 13h",
    clippers: 627,
    status: "Open",
  },
  {
    id: "samsung-galaxy-cam",
    brand: "Samsung",
    handle: "@samsung",
    title: "Show what the Galaxy camera can really do after dark",
    category: "Tech",
    image: photo("samsung-night-city"),
    platforms: ["YouTube", "Reels"],
    rewardPool: 28900,
    paidOut: 6300,
    ratePer1k: 3.0,
    timeLeft: "12d 2h",
    clippers: 198,
    status: "Open",
  },
  {
    id: "sephora-grwm",
    brand: "Sephora",
    handle: "@sephora",
    title: "Get-ready-with-me clips that actually convert",
    category: "Beauty",
    image: photo("sephora-makeup-studio"),
    platforms: ["TikTok", "Reels", "Instagram"],
    rewardPool: 19750,
    paidOut: 4900,
    ratePer1k: 3.4,
    timeLeft: "1d 9h",
    clippers: 423,
    status: "Ending soon",
  },
  {
    id: "hellofresh-cook",
    brand: "HelloFresh",
    handle: "@hellofresh",
    title: "Best 30-second cook-along recipe clips",
    category: "Food",
    image: photo("hellofresh-kitchen-cook"),
    platforms: ["TikTok", "YouTube"],
    rewardPool: 14300,
    paidOut: 3120,
    ratePer1k: 2.3,
    timeLeft: "15d 1h",
    clippers: 164,
    status: "Open",
  },
  {
    id: "easports-fc",
    brand: "EA Sports FC",
    handle: "@eafc",
    title: "Capture your filthiest goals and skill moves",
    category: "Gaming",
    image: photo("easports-stadium-night"),
    platforms: ["YouTube", "TikTok", "X"],
    rewardPool: 36200,
    paidOut: 15050,
    ratePer1k: 3.1,
    timeLeft: "11d 7h",
    clippers: 588,
    status: "Open",
  },
];

export const categories: Category[] = [
  "Sports",
  "Music",
  "Tech",
  "Food",
  "Entertainment",
  "Beauty",
  "Gaming",
];

export const usdc = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Compact USD, e.g. $59.6K. Computed manually rather than via
 * `Intl` compact notation, whose output differs between the Node server
 * and browser ICU and would cause React hydration mismatches.
 */
export const usdcCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `$${n}`;
};
