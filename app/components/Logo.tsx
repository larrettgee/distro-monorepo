import Image from "next/image";

/** Official Distro spore mark (public/distro-logo.png). */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/distro-logo.png"
      alt="Distro logo"
      width={516}
      height={503}
      priority
      style={{ height: size, width: "auto" }}
      className="select-none"
    />
  );
}

export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="font-display text-2xl font-bold tracking-tight text-cloud">distro</span>
    </span>
  );
}
