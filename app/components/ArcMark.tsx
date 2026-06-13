import Image from "next/image";

/** Arc network mark (public/arc-logo.png). Used as the on-network indicator. */
export function ArcMark({ size = 16 }: { size?: number }) {
  return (
    <Image
      src="/arc-logo.png"
      alt="Arc"
      width={175}
      height={176}
      style={{ height: size, width: "auto" }}
      className="shrink-0 select-none"
    />
  );
}
