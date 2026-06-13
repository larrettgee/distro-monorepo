import type { VerificationStatus } from "@/lib/api/types";

/**
 * Canonical verification symbol used everywhere a World ID status is shown:
 * a shield — checked + green when verified, alerted + amber when not.
 * Use {@link VerificationMark} for the bare icon and {@link VerificationBadge}
 * for the labelled pill so the symbology stays identical across the app.
 */
export function VerificationMark({
  status,
  size = 15,
  className,
}: {
  status: VerificationStatus;
  size?: number;
  className?: string;
}) {
  const verified = status === "verified";
  return (
    <span
      title={
        verified
          ? "World ID verified"
          : "Unverified — verify with World ID to unlock payouts"
      }
      aria-label={verified ? "World ID verified" : "Account unverified"}
      className={`${verified ? "text-distro" : "text-amber-400"} ${className ?? ""}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2 4 5v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V5l-8-3Z" />
        {verified ? (
          <path d="m9 12 2 2 4-4" />
        ) : (
          <>
            <line x1="12" y1="8" x2="12" y2="12.5" />
            <circle cx="12" cy="15.5" r="0.6" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </span>
  );
}

/** Labelled pill: the shield plus "Verified" / "Unverified". */
export function VerificationBadge({
  status,
  size = 13,
}: {
  status: VerificationStatus;
  size?: number;
}) {
  const verified = status === "verified";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        verified ? "bg-distro/15 text-distro" : "bg-amber-400/10 text-amber-300"
      }`}
    >
      <VerificationMark status={status} size={size} className="!text-current" />
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}
