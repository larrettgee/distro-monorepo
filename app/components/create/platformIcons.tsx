type P = { size?: number; className?: string };

export const YouTubeLogo = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000" />
    <path d="M10 8.5 15 12l-5 3.5z" fill="#fff" />
  </svg>
);

export const TikTokLogo = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.5 3c.3 2 1.5 3.4 3.5 3.7v2.5c-1.3 0-2.5-.4-3.5-1v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2 2.8V3h2.7z" />
  </svg>
);

export const XLogo = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5.3 22H2l7.6-8.7L1.4 2H8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.3 4H5.4l12.3 16Z" />
  </svg>
);

export const InstagramLogo = ({ size = 20, className }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    aria-hidden
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
