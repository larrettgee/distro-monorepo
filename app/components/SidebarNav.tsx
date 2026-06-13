"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMyAccount, useClipperProfile } from "@/lib/api/hooks";
import { CreateButton } from "./CreateButton";
import { VerificationMark } from "./VerificationMark";
import {
  IconHome,
  IconCampaigns,
  IconTrending,
  IconTrophy,
  IconUsers,
  IconUser,
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
  const pathname = usePathname();

  const isBrand = account?.initialized && account.type === "brand";
  const isClipper = account?.initialized && account.type === "clipper";
  const channelCount = profile?.channels?.length ?? 0;

  const cls = (href: string) =>
    `${link} ${pathname === href ? active : idle}`;

  return (
    <>
      <nav className="mt-8 flex flex-col gap-1">
        <Link href="/" className={cls("/")}>
          <IconHome size={19} />
          Home
        </Link>

        {/* Discovery — relevant to clippers and signed-out visitors, not brands.
            "Campaigns" (/#explore) is omitted: it lands on the same home view. */}
        {!isBrand && (
          <Link href="/trending" className={cls("/trending")}>
            <IconTrending size={19} />
            Trending
          </Link>
        )}

        {/* Leaderboard is relevant to everyone — climbing it (clippers) and scouting talent (brands). */}
        <Link href="/leaderboard" className={cls("/leaderboard")}>
          <IconTrophy size={19} />
          Leaderboard
        </Link>

        {isBrand && (
          <Link href="/dashboard" className={cls("/dashboard")}>
            <IconCampaigns size={19} />
            My campaigns
          </Link>
        )}

        {isClipper && (
          <Link href="/socials" className={cls("/socials")}>
            <IconUsers size={19} />
            Manage socials
            {channelCount > 0 && (
              <span className="ml-auto rounded-full bg-panel-2 px-1.5 text-xs text-cloud/60">
                {channelCount}
              </span>
            )}
          </Link>
        )}

        {/* Account sits with the rest of the nav, carrying the verification mark. */}
        {account?.initialized && account.verificationStatus && (
          <Link href="/account" className={cls("/account")}>
            <IconUser size={19} />
            Account
            <span className="ml-auto">
              <VerificationMark status={account.verificationStatus} size={16} />
            </span>
          </Link>
        )}
      </nav>

      {/* Create campaign is a brand action — pinned toward the bottom. */}
      {!isClipper && (
        <CreateButton variant="primary" className="mt-auto w-full px-3 py-2.5">
          Create campaign
        </CreateButton>
      )}

      {/* Tagline always sits at the very bottom of the sidebar. */}
      <p
        className={`${isClipper ? "mt-auto" : "mt-3"} px-2 text-xs leading-relaxed text-cloud/40`}
      >
        Distribution is everything.
      </p>
    </>
  );
}
