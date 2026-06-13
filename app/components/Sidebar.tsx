import Link from "next/link";
import { Wordmark } from "./Logo";
import {
  IconHome,
  IconCampaigns,
  IconTrending,
  IconTrophy,
  IconLive,
  IconSupport,
  IconPlus,
} from "./icons";

const nav = [
  { label: "Home", href: "#top", Icon: IconHome, active: true },
  { label: "Campaigns", href: "#explore", Icon: IconCampaigns },
  { label: "Trending", href: "#trending", Icon: IconTrending },
  { label: "Leaderboard", href: "#", Icon: IconTrophy },
  { label: "Live", href: "#", Icon: IconLive },
  { label: "Support", href: "#", Icon: IconSupport },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline bg-panel px-4 py-5 lg:flex">
      <Link href="#top" className="px-2">
        <Wordmark size={28} />
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {nav.map(({ label, href, Icon, active }) => (
          <a
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-panel-2 text-cloud"
                : "text-cloud/60 hover:bg-panel-2 hover:text-cloud"
            }`}
          >
            <Icon size={19} />
            {label}
          </a>
        ))}
      </nav>

      <a
        href="#"
        className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-distro px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-mint active:scale-[0.98]"
      >
        <IconPlus size={18} />
        Create campaign
      </a>

      <p className="mt-auto px-2 text-xs leading-relaxed text-cloud/40">
        Distribution is everything.
      </p>
    </aside>
  );
}
