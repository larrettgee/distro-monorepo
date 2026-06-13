import type { AccountType, VerificationStatus } from '../accounts/accounts.types';

/** Minimal account view attached to the request by PrivyAuthGuard. */
export interface AccountSnapshot {
  privyId: string;
  walletAddress: string;
  username: string;
  type: AccountType;
  verificationStatus: VerificationStatus;
}

/** Shape of `request.user` on authenticated requests. */
export interface AuthenticatedUser {
  /** Privy DID (token `sub`). */
  privyId: string;
  /** Present once the user has a registered Account. */
  account: AccountSnapshot | null;
}
