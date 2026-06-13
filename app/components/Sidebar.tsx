import Link from "next/link";
import { Wordmark } from "./Logo";
import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline bg-panel px-4 py-5 lg:flex">
      <Link href="/" className="px-2">
        <Wordmark size={28} />
      </Link>

      <SidebarNav />

      <p className="mt-4 px-2 text-xs leading-relaxed text-cloud/40">
        Distribution is everything.
      </p>
    </aside>
  );
}
