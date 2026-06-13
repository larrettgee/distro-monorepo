import Link from "next/link";
import { Wordmark } from "./Logo";
import { ConnectWallet } from "./ConnectWallet";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-ink/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="shrink-0">
          <Wordmark size={30} />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-cloud/70 md:flex">
          <a href="#campaigns" className="transition-colors hover:text-distro">
            Campaigns
          </a>
          <a href="#how" className="transition-colors hover:text-distro">
            How it works
          </a>
          <a href="#" className="transition-colors hover:text-distro">
            Leaderboard
          </a>
        </div>

        <ConnectWallet />
      </nav>
    </header>
  );
}
