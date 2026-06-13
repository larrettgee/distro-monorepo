import type { ReactNode } from "react";

/** Centered empty / error / not-found state used across pages. */
export function StateBlock({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Override the wrapper width (defaults to a narrow centered card). */
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex flex-col items-center rounded-2xl border border-hairline bg-panel px-6 py-12 text-center ${className ?? "max-w-sm"}`}
    >
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-panel-2 text-cloud/45">
          {icon}
        </div>
      )}
      <h2 className="font-display text-lg font-bold text-cloud">{title}</h2>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-cloud/55">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const AlertIcon = () => (
  <svg {...iconProps} aria-hidden>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);

export const InboxIcon = () => (
  <svg {...iconProps} aria-hidden>
    <path d="M3 12h5l2 3h4l2-3h5" />
    <path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5L5 5Z" />
  </svg>
);

export const SearchOffIcon = () => (
  <svg {...iconProps} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8.5 11h5" />
  </svg>
);

/** Minimal loading spinner. */
export function Spinner({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`animate-spin ${className}`}
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
