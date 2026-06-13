import { Wordmark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Wordmark size={26} />
        <p className="text-sm text-cloud/50">Distribution is everything. · Built on Arc Testnet</p>
      </div>
    </footer>
  );
}
