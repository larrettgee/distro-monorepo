"use client";

import Link from "next/link";
import { useMyAccount, useClipperProfile } from "@/lib/api/hooks";
import { CreateButton } from "./CreateButton";
import {
  IconHome,
  IconCampaigns,
  IconTrending,
  IconTrophy,
  IconUsers,
} from "./icons";

const link =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const active = "bg-panel-2 text-cloud";
const idle = "text-cloud/60 hover:bg-panel-2 hover:text-cloud";

/**
 * Role-aware sidebar navigation. Brands and clippers only see the tabs that
 * are relevant to them; signed-out / not-yet-initialized accounts see the
 * public discovery tabs.
 */
export function SidebarNav() {
  const { data: account } = useMyAccount();
  const { data: profile } = useClipperProfile();

  const isBrand = account?.initialized && account.type === "brand";
  const isClipper = account?.initialized && account.type === "clipper";
  const channelCount = profile?.channels?.length ?? 0;

  return (
    <>
      <nav className="mt-8 flex flex-col gap-1">
        <Link href="/" className={`${link} ${active}`}>
          <IconHome size={19} />
          Home
        </Link>

        {/* Discovery — relevant to clippers and signed-out visitors, not brands.
            "Campaigns" (/#explore) is omitted: it lands on the same home view. */}
        {!isBrand && (
          <Link href="/#trending" className={`${link} ${idle}`}>
            <IconTrending size={19} />
            Trending
          </Link>
        )}

        {/* Leaderboard is relevant to everyone — climbing it (clippers) and scouting talent (brands). */}
        <Link href="/leaderboard" className={`${link} ${idle}`}>
          <IconTrophy size={19} />
          Leaderboard
        </Link>

        {isBrand && (
          <Link href="/dashboard" className={`${link} ${idle}`}>
            <IconCampaigns size={19} />
            My campaigns
          </Link>
        )}

        {isClipper && (
          <Link href="/socials" className={`${link} ${idle}`}>
            <IconUsers size={19} />
            Manage socials
            {channelCount > 0 && (
              <span className="ml-auto rounded-full bg-panel-2 px-1.5 text-xs text-cloud/60">
                {channelCount}
              </span>
            )}
          </Link>
        )}
      </nav>

      {/* Creating a campaign is a brand action — hide it from clippers. */}
      {!isClipper && (
        <CreateButton variant="primary" className="mt-6 w-full px-3 py-2.5">
          Create campaign
        </CreateButton>
      )}
    </>
  );
}
