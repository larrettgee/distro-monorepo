import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Hex } from 'viem';
import type { AuthenticatedUser } from '../auth/auth.types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { NATIVE_TOKEN } from '../blockchain/blockchain.constants';
import type { AppConfig } from '../config/configuration';
import { toBaseUnits, toDisplayUnits } from './campaigns.utils';
import type { CampaignStatus } from './campaigns.types';
import {
  CampaignPerformanceDto,
  CampaignResponseDto,
  CreateCampaignResponseDto,
} from './dto/campaign-response.dto';
import { ConfirmCampaignDto } from './dto/confirm-campaign.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign, type CampaignDocument } from './schemas/campaign.schema';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly blockchain: BlockchainService,
  ) {}

  // ─── Mutations ───

  async create(
    user: AuthenticatedUser,
    dto: CreateCampaignDto,
  ): Promise<CreateCampaignResponseDto> {
    if (!user.account) {
      throw new ForbiddenException('Account is not registered.');
    }
    const chain = this.config.get('chain', { infer: true });
    // On Arc the budget is the native gas token (USDC), so no ERC-20 address is
    // needed. The operator (recordViews caller) defaults to the brand's own
    // wallet until a dedicated operator / Chainlink CRE key is configured.
    const operator = chain.operatorAddress || user.account.walletAddress;

    const campaign = await this.campaignModel.create({
      brandPrivyId: user.privyId,
      brandWallet: user.account.walletAddress,
      brandUsername: user.account.username,
      title: dto.title,
      description: dto.description,
      sourceContentUrl: dto.sourceContentUrl,
      systemRules: dto.systemRules ?? '',
      budgetUsdc: dto.budgetUsdc,
      ratePerThousandViews: dto.ratePerThousandViews,
      platforms: dto.platforms ?? ['youtube'],
      tokenAddress: NATIVE_TOKEN,
      operatorAddress: operator,
      status: 'pending_onchain',
    });

    const decimals = chain.usdcDecimals;
    return {
      campaign: this.toResponse(campaign),
      onchain: {
        funding: 'native',
        escrowAddress: chain.escrowAddress,
        operator,
        pricePerThousandViews: toBaseUnits(
          dto.ratePerThousandViews,
          decimals,
        ).toString(),
        budget: toBaseUnits(dto.budgetUsdc, decimals).toString(),
        chainId: chain.id,
      },
    };
  }

  async confirm(
    user: AuthenticatedUser,
    id: string,
    dto: ConfirmCampaignDto,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.findOwned(user, id);
    if (campaign.status !== 'pending_onchain') {
      throw new UnprocessableEntityException(
        'Campaign is already confirmed on-chain.',
      );
    }

    const event = await this.blockchain.parseJobCreatedFromTx(
      dto.txHash as Hex,
    );
    if (event.brand.toLowerCase() !== campaign.brandWallet.toLowerCase()) {
      throw new UnprocessableEntityException(
        'Transaction brand does not match the campaign owner.',
      );
    }
    if (event.token.toLowerCase() !== NATIVE_TOKEN) {
      throw new UnprocessableEntityException(
        'Campaign must be funded with the native token (createJobNative).',
      );
    }

    campaign.onchainJobId = Number(event.jobId);
    campaign.createTxHash = dto.txHash;
    campaign.status = 'active';
    await campaign.save();
    return this.toResponse(campaign);
  }

  // ─── Queries ───

  async findAll(status: CampaignStatus = 'active'): Promise<CampaignResponseDto[]> {
    const campaigns = await this.campaignModel
      .find({ status })
      .sort({ createdAt: -1 })
      .exec();
    return campaigns.map((c) => this.toResponse(c));
  }

  /**
   * Active campaigns confirmed on-chain (have a job id). Returns raw documents
   * for internal cross-module use (e.g. the CRE daily batch), mirroring
   * `findById`. Sorted ascending by creation for deterministic batch ordering.
   */
  async findActiveOnchainDocs(): Promise<CampaignDocument[]> {
    return this.campaignModel
      .find({ status: 'active', onchainJobId: { $exists: true, $ne: null } })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<CampaignResponseDto> {
    return this.toResponse(await this.findById(id));
  }

  /** A brand's funded campaigns (have an on-chain job id). Raw docs for internal use. */
  async findFundedByBrand(brandPrivyId: string): Promise<CampaignDocument[]> {
    return this.campaignModel
      .find({ brandPrivyId, onchainJobId: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPerformance(
    user: AuthenticatedUser,
    id: string,
  ): Promise<CampaignPerformanceDto> {
    const campaign = await this.findOwned(user, id);
    const base: CampaignPerformanceDto = {
      campaign: this.toResponse(campaign),
      budgetUsdc: null,
      allocatedUsdc: null,
      remainingUsdc: null,
      closed: null,
    };
    if (campaign.onchainJobId === undefined) {
      return base;
    }

    const decimals = this.config.get('chain.usdcDecimals', { infer: true });
    const jobId = BigInt(campaign.onchainJobId);
    const [job, remaining] = await Promise.all([
      this.blockchain.getJob(jobId),
      this.blockchain.getRemaining(jobId),
    ]);
    return {
      ...base,
      budgetUsdc: toDisplayUnits(job.budget, decimals),
      allocatedUsdc: toDisplayUnits(job.allocated, decimals),
      remainingUsdc: toDisplayUnits(remaining, decimals),
      closed: job.closed,
    };
  }

  // ─── Internal helpers ───

  /** Used by other modules (e.g. submissions) that need the raw campaign. */
  async findById(id: string): Promise<CampaignDocument> {
    const campaign = await this.campaignModel.findById(id).exec();
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }
    return campaign;
  }

  private async findOwned(
    user: AuthenticatedUser,
    id: string,
  ): Promise<CampaignDocument> {
    const campaign = await this.findById(id);
    if (campaign.brandPrivyId !== user.privyId) {
      throw new ForbiddenException('You do not own this campaign.');
    }
    return campaign;
  }

  private toResponse(c: CampaignDocument): CampaignResponseDto {
    return {
      id: c.id,
      brandWallet: c.brandWallet,
      brandUsername: c.brandUsername,
      title: c.title,
      description: c.description,
      sourceContentUrl: c.sourceContentUrl,
      platforms: c.platforms,
      systemRules: c.systemRules,
      budgetUsdc: c.budgetUsdc,
      paidUsdc: c.paidUsdc ?? 0,
      ratePerThousandViews: c.ratePerThousandViews,
      status: c.status,
      onchainJobId: c.onchainJobId ?? null,
      createTxHash: c.createTxHash ?? null,
      createdAt: (c.get('createdAt') as Date).toISOString(),
    };
  }
}
