"use client";

import { useRef, type ReactNode } from "react";
import { IconChevronLeft, IconChevronRight } from "./icons";

export function ScrollRow({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  const arrow =
    "grid h-8 w-8 place-items-center rounded-lg border border-hairline text-cloud/70 transition hover:border-white/20 hover:bg-panel hover:text-cloud active:scale-95";

  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-cloud">{title}</h2>
        <div className="flex items-center gap-2">
          <a href="#explore" className="mr-1 text-sm text-cloud/50 transition-colors hover:text-cloud">
            View all
          </a>
          <button onClick={() => scroll(-1)} className={arrow} aria-label="Scroll left">
            <IconChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className={arrow} aria-label="Scroll right">
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
        {children}
      </div>
    </section>
  );
}
