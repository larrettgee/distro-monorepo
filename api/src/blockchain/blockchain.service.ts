import {
  Injectable,
  Logger,
  NotImplementedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type Hex,
  createPublicClient,
  defineChain,
  getContract,
  http,
  parseEventLogs,
} from 'viem';
import type { AppConfig } from '../config/configuration';
import { DISTRO_ESCROW_ABI } from './abi/distro-escrow.abi';
import type { JobCreatedEvent, OnchainJob } from './blockchain.types';

/**
 * Build a concretely-typed escrow contract instance. Returning from a helper
 * lets the fields infer concrete types; `getContract(...).read.*` also avoids
 * viem's `readContract` call-parameter typing quirks.
 */
function createEscrowContract(rpcUrl: string, chainId: number, address: Hex) {
  const client = createPublicClient({
    chain: defineChain({
      id: chainId,
      name: 'Arc',
      nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
    }),
    transport: http(rpcUrl),
  });
  return { client, contract: getContract({ address, abi: DISTRO_ESCROW_ABI, client }) };
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly client: ReturnType<typeof createEscrowContract>['client'];
  private readonly contract: ReturnType<typeof createEscrowContract>['contract'];
  private readonly escrow: Hex;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const chain = config.get('chain', { infer: true });
    this.escrow = chain.escrowAddress as Hex;
    const { client, contract } = createEscrowContract(
      chain.rpcUrl,
      chain.id,
      this.escrow,
    );
    this.client = client;
    this.contract = contract;
  }

  // ─── Reads ───

  async getJob(jobId: bigint): Promise<OnchainJob> {
    const job = await this.contract.read.getJob([jobId]);
    return {
      brand: job.brand,
      operator: job.operator,
      token: job.token,
      pricePerThousandViews: job.pricePerThousandViews,
      budget: job.budget,
      allocated: job.allocated,
      closed: job.closed,
    };
  }

  getRemaining(jobId: bigint): Promise<bigint> {
    return this.contract.read.remaining([jobId]);
  }

  getOwed(jobId: bigint, recipient: Hex): Promise<bigint> {
    return this.contract.read.owed([jobId, recipient]);
  }

  getRecordedViews(jobId: bigint, recipient: Hex): Promise<bigint> {
    return this.contract.read.recordedViews([jobId, recipient]);
  }

  getNextJobId(): Promise<bigint> {
    return this.contract.read.nextJobId();
  }

  /** Read a createJob tx receipt and decode the JobCreated event it emitted. */
  async parseJobCreatedFromTx(txHash: Hex): Promise<JobCreatedEvent> {
    const receipt = await this.client.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') {
      throw new UnprocessableEntityException('Transaction did not succeed.');
    }

    const events = parseEventLogs({
      abi: DISTRO_ESCROW_ABI,
      eventName: 'JobCreated',
      logs: receipt.logs,
    });
    const event = events.find(
      (log) =>
        log.address.toLowerCase() === this.escrow.toLowerCase(),
    );
    if (!event) {
      throw new UnprocessableEntityException(
        'No JobCreated event found in the transaction for the escrow contract.',
      );
    }

    return {
      jobId: event.args.id,
      brand: event.args.brand,
      operator: event.args.operator,
      token: event.args.token,
      pricePerThousandViews: event.args.pricePerThousandViews,
      budget: event.args.budget,
      txHash,
    };
  }

  // ─── Writes (deferred) ───

  /**
   * STUB. recordViews is operator-only on-chain. Until an operator key / the
   * Chainlink CRE pipeline is wired up, this is intentionally not implemented.
   * TODO: sign and send recordViews(id, recipients, views) as the operator.
   */
  recordViews(): Promise<never> {
    this.logger.warn('recordViews is not implemented (stub).');
    throw new NotImplementedException(
      'On-chain recordViews is not wired yet (pending operator key / Chainlink CRE).',
    );
  }
}
