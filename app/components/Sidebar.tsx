import Link from "next/link";
import { Wordmark } from "./Logo";
import { CreateButton } from "./CreateButton";
import { RoleNav } from "./RoleNav";
import {
  IconHome,
  IconCampaigns,
  IconTrending,
  IconTrophy,
  IconLive,
  IconSupport,
} from "./icons";

const nav = [
  { label: "Home", href: "/", Icon: IconHome, active: true },
  { label: "Campaigns", href: "/#explore", Icon: IconCampaigns },
  { label: "Trending", href: "/#trending", Icon: IconTrending },
  { label: "Leaderboard", href: "#", Icon: IconTrophy },
  { label: "Live", href: "#", Icon: IconLive },
  { label: "Support", href: "#", Icon: IconSupport },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline bg-panel px-4 py-5 lg:flex">
      <Link href="/" className="px-2">
        <Wordmark size={28} />
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {nav.map(({ label, href, Icon, active }) => (
          <Link
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
          </Link>
        ))}
        <RoleNav />
      </nav>

      <CreateButton variant="primary" className="mt-6 w-full px-3 py-2.5">
        Create campaign
      </CreateButton>

      <p className="mt-auto px-2 text-xs leading-relaxed text-cloud/40">
        Distribution is everything.
      </p>
    </aside>
  );
}
