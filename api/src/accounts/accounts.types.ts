export const ACCOUNT_TYPES = ['brand', 'clipper'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const VERIFICATION_STATUSES = ['unverified', 'verified'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Synthetic status returned for a logged-in Privy user with no Account yet. */
export const UNINITIALIZED = 'uninitialized' as const;

/** Public username constraints (shared by the DTO validator). */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
