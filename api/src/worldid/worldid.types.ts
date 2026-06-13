import type { ResponseItemV4 } from '@worldcoin/idkit-core';

/**
 * IDKit v4 result returned by the World App and forwarded for verification.
 * The index signature preserves any extra fields (e.g. integrity_bundle) so
 * the proof can be forwarded to the verifier byte-for-byte.
 */
export interface WorldIdProof {
  protocol_version: string;
  nonce: string;
  action: string;
  environment: string;
  responses: ResponseItemV4[];
  user_presence_completed?: boolean;
  [key: string]: unknown;
}

export interface WorldIdVerificationResult {
  verified: boolean;
  /** RP-scoped, action-scoped nullifier — the anti-replay / uniqueness key. */
  nullifier: string;
  action: string;
}

/** Signed request context the frontend feeds to IDKitRequestWidget. */
export interface WorldIdRpContext {
  appId: string;
  action: string;
  environment: 'production' | 'staging';
  rpContext: {
    rp_id: string;
    nonce: string;
    created_at: number;
    expires_at: number;
    signature: string;
  };
}
