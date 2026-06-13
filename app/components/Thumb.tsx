import Image from "next/image";
import type { ReactNode } from "react";
import type { Campaign } from "@/lib/campaigns";

/**
 * Campaign photo tile. Lives inside a `group` card — the image zooms on
 * card hover. The status pill sits on a solid scrim (no gradients).
 */
export function Thumb({
  c,
  className,
  sizes,
  children,
}: {
  c: Campaign;
  className?: string;
  sizes?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-panel-2 ${className ?? ""}`}>
      <Image
        src={c.image}
        alt={c.brand}
        fill
        sizes={sizes ?? "320px"}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-cloud backdrop-blur-sm">
        {c.status}
      </span>
      {children}
    </div>
  );
}
