import Link from "next/link";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ConnectWallet } from "./ConnectWallet";
import { IconChevronLeft } from "./icons";

/** Sidebar + a simple top bar (back link + wallet), for non-marketplace pages. */
export function AppShell({ children, backHref = "/" }: { children: ReactNode; backHref?: string }) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur md:px-6">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm text-cloud/70 transition-colors hover:text-cloud"
          >
            <IconChevronLeft size={16} />
            Back
          </Link>
          <ConnectWallet />
        </header>
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
