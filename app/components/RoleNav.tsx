"use client";

import Link from "next/link";
import { useMyAccount, useClipperProfile } from "@/lib/api/hooks";
import { useClipperConnect } from "./clipper/ClipperConnectProvider";
import { IconCampaigns, IconFilm } from "./icons";

const item =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-cloud/60 transition-colors hover:bg-panel-2 hover:text-cloud";

export function RoleNav() {
  const { data: account } = useMyAccount();
  const { data: profile } = useClipperProfile();
  const { openConnect } = useClipperConnect();

  if (!account?.initialized) return null;

  if (account.type === "brand") {
    return (
      <Link href="/dashboard" className={item}>
        <IconCampaigns size={19} />
        My campaigns
      </Link>
    );
  }

  return (
    <button onClick={openConnect} className={item}>
      <IconFilm size={19} />
      {profile?.connected ? "YouTube connected" : "Connect YouTube"}
    </button>
  );
}
