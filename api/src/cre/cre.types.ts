/** A clipper wallet and its summed cumulative views across a campaign's clips. */
export interface AggregatedRecipient {
  wallet: string;
  cumulativeViews: number;
}

/** One on-chain job's payout instruction: who gets credited, via which reporter. */
export interface JobBatch {
  jobId: number;
  /** EscrowViewsReporter (the job's operator) the CRE writes the report to. */
  reporterAddress: string;
  recipients: AggregatedRecipient[];
}

/** The full daily snapshot the CRE pulls and moves on-chain. */
export interface DailyBatchPayload {
  /** UTC day key (YYYY-MM-DD) this snapshot was computed for. */
  dateKey: string;
  chainId: number;
  /** ISO timestamp the snapshot was first generated (stable once persisted). */
  generatedAt: string;
  jobs: JobBatch[];
}
