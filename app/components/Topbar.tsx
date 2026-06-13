import { ConnectWallet } from "./ConnectWallet";
import { CreateButton } from "./CreateButton";
import { IconSearch } from "./icons";

export function Topbar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur md:px-6">
      <label className="flex h-10 flex-1 items-center gap-2.5 rounded-lg border border-hairline bg-panel px-3 text-cloud transition-colors focus-within:border-white/25">
        <IconSearch size={18} className="text-cloud/50" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search campaigns and brands…"
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-cloud/40"
        />
        <kbd className="hidden rounded border border-hairline px-1.5 py-0.5 font-sans text-[11px] text-cloud/40 sm:block">
          ⌘K
        </kbd>
      </label>

      <CreateButton variant="outline" className="hidden h-10 px-3.5 sm:flex">
        Create
      </CreateButton>

      <ConnectWallet />
    </header>
  );
}
