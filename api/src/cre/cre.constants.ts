import type { SubmissionStatus } from '../submissions/submissions.types';

/** Header carrying the shared secret the CRE workflow uses to authenticate. */
export const CRE_API_KEY_HEADER = 'x-cre-api-key';

/**
 * Submission statuses eligible to be paid out on-chain. There is no review flow
 * yet, so everything that isn't explicitly rejected is payable.
 */
export const PAYABLE_SUBMISSION_STATUSES: readonly SubmissionStatus[] = [
  'pending',
  'accepted',
];

/**
 * Determinism bucket for the batch's `generatedAt`. The batch is otherwise a
 * pure function of stored DB state, so every DON node that calls within the
 * same bucket gets a byte-identical response (required for identical-consensus),
 * while data added since the last bucket still appears immediately.
 */
export const CRE_BATCH_BUCKET_MS = 5 * 60 * 1000; // 5 minutes
