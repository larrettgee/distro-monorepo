/** Decoded on-chain Job state (from getJob). bigints for token amounts. */
export interface OnchainJob {
  brand: string;
  operator: string;
  token: string;
  pricePerThousandViews: bigint;
  budget: bigint;
  allocated: bigint;
  closed: boolean;
}

/** Decoded JobCreated event args used to confirm a campaign on-chain. */
export interface JobCreatedEvent {
  jobId: bigint;
  brand: string;
  operator: string;
  token: string;
  pricePerThousandViews: bigint;
  budget: bigint;
  txHash: string;
}
