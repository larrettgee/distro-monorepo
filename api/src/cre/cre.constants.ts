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

/** Mongo collection holding the per-day batch snapshots served to the CRE. */
export const CRE_DAILY_BATCH_COLLECTION = 'cre_daily_batches';
