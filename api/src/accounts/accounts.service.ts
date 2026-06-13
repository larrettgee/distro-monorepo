import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { type Hex, formatUnits } from 'viem';
import { AuthService } from '../auth/auth.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import type { AppConfig } from '../config/configuration';
import {
  Submission,
  type SubmissionDocument,
} from '../submissions/schemas/submission.schema';
import { WorldIdService } from '../worldid/worldid.service';
import type { WorldIdProof, WorldIdRpContext } from '../worldid/worldid.types';
import { AccountResponseDto } from './dto/account-response.dto';
import { AccountOverviewDto } from './dto/account-overview.dto';
import { RegisterAccountDto } from './dto/register-account.dto';
import { VerifyWorldIdDto } from './dto/verify-worldid.dto';
import { Account, type AccountDocument } from './schemas/account.schema';

/** Arc settles in 18-decimal native USDC. */
const TOKEN_DECIMALS = 18;

function toUsdc(wei: bigint): number {
  return Math.round(Number(formatUnits(wei, TOKEN_DECIMALS)) * 100) / 100;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly authService: AuthService,
    private readonly worldIdService: WorldIdService,
    private readonly blockchain: BlockchainService,
    private readonly campaigns: CampaignsService,
    private readonly leaderboard: LeaderboardService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // ─── Queries ───

  async getMe(privyId: string): Promise<AccountResponseDto> {
    const account = await this.accountModel.findOne({ privyId }).lean().exec();
    if (!account) {
      return {
        initialized: false,
        privyId,
        walletAddress: null,
        username: null,
        type: null,
        verificationStatus: null,
      };
    }
    return this.toResponse(account);
  }

  // ─── Mutations ───

  async register(
    privyId: string,
    dto: RegisterAccountDto,
  ): Promise<AccountResponseDto> {
    const existing = await this.accountModel.exists({ privyId });
    if (existing) {
      throw new ConflictException('Account already registered.');
    }
    // Case-insensitive uniqueness (username is [a-zA-Z0-9_], safe in a regex).
    const usernameTaken = await this.accountModel.exists({
      username: { $regex: `^${dto.username}$`, $options: 'i' },
    });
    if (usernameTaken) {
      throw new ConflictException('Username is already taken.');
    }
    const walletAddress = await this.authService.getWalletAddress(privyId);
    const created = await this.accountModel.create({
      privyId,
      walletAddress,
      username: dto.username,
      type: dto.type,
      verificationStatus: 'unverified',
    });
    return this.toResponse(created);
  }

  async updateUsername(
    privyId: string,
    username: string,
  ): Promise<AccountResponseDto> {
    const account = await this.accountModel.findOne({ privyId }).exec();
    if (!account) {
      throw new NotFoundException('Account is not registered.');
    }
    if (account.username?.toLowerCase() !== username.toLowerCase()) {
      const taken = await this.accountModel.exists({
        username: { $regex: `^${username}$`, $options: 'i' },
        privyId: { $ne: privyId },
      });
      if (taken) {
        throw new ConflictException('Username is already taken.');
      }
    }
    account.username = username;
    await account.save();
    return this.toResponse(account);
  }

  /**
   * High-level account dashboard. Brand fields cover spend / escrow, clipper
   * fields cover earnings / on-chain claimable. On-chain reads are best-effort:
   * a failing RPC degrades a figure to 0 rather than failing the whole call.
   */
  async getOverview(privyId: string): Promise<AccountOverviewDto> {
    const account = await this.accountModel.findOne({ privyId }).lean().exec();
    const chain = this.config.get('chain', { infer: true });

    const base: AccountOverviewDto = {
      type: account?.type ?? null,
      username: account?.username ?? null,
      verificationStatus: account?.verificationStatus ?? null,
      walletAddress: account?.walletAddress ?? null,
      escrowAddress: chain.escrowAddress,
      chainId: chain.id,
      campaignsCount: null,
      totalSpentUsdc: null,
      inEscrowUsdc: null,
      totalViews: null,
      clipCount: null,
      estimatedEarningsUsdc: null,
      claimableUsdc: null,
      claimable: null,
    };

    if (account?.type === 'brand') {
      const funded = await this.campaigns.findFundedByBrand(privyId);
      base.campaignsCount = funded.length;
      base.totalSpentUsdc =
        Math.round(
          funded.reduce((sum, c) => sum + (c.budgetUsdc ?? 0), 0) * 100,
        ) / 100;

      let inEscrow = BigInt(0);
      for (const c of funded) {
        if (c.onchainJobId == null) continue;
        try {
          inEscrow += await this.blockchain.getRemaining(
            BigInt(c.onchainJobId),
          );
        } catch {
          /* RPC hiccup — skip this job's escrow figure */
        }
      }
      base.inEscrowUsdc = toUsdc(inEscrow);
    }

    if (account?.type === 'clipper') {
      const stats = await this.leaderboard.getStatsForClipper(privyId);
      base.totalViews = stats.totalViews;
      base.clipCount = stats.clipCount;
      base.estimatedEarningsUsdc = stats.estimatedEarningsUsdc;

      const wallet = account.walletAddress as Hex | null;
      const claimable: AccountOverviewDto['claimable'] = [];
      let claimableTotal = BigInt(0);

      if (wallet) {
        const campaignIds: string[] = await this.submissionModel.distinct(
          'campaignId',
          { clipperPrivyId: privyId, status: { $ne: 'rejected' } },
        );
        for (const id of campaignIds) {
          try {
            const campaign = await this.campaigns.findById(id);
            if (campaign.onchainJobId == null) continue;
            const owed = await this.blockchain.getOwed(
              BigInt(campaign.onchainJobId),
              wallet,
            );
            if (owed > BigInt(0)) {
              claimableTotal += owed;
              claimable!.push({
                campaignId: id,
                campaignTitle: campaign.title,
                jobId: campaign.onchainJobId,
                owedUsdc: toUsdc(owed),
              });
            }
          } catch {
            /* skip campaigns we can't resolve / read */
          }
        }
      }
      base.claimable = claimable;
      base.claimableUsdc = toUsdc(claimableTotal);
    }

    return base;
  }

  /** Signed rp_context the frontend feeds to the IDKit widget. */
  getWorldIdContext(): WorldIdRpContext {
    return this.worldIdService.createRpContext();
  }

  async verifyWorldId(
    privyId: string,
    dto: VerifyWorldIdDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountModel.findOne({ privyId }).exec();
    if (!account) {
      throw new NotFoundException('Account is not registered.');
    }

    // dto is the IDKit v4 proof, forwarded verbatim to the World verifier.
    const result = await this.worldIdService.verifyProof(
      dto as unknown as WorldIdProof,
    );

    // Enforce one-person-one-account via the nullifier.
    const claimed = await this.accountModel.exists({
      worldIdNullifier: result.nullifier,
      privyId: { $ne: privyId },
    });
    if (claimed) {
      throw new ConflictException(
        'This World ID has already verified another account.',
      );
    }

    account.verificationStatus = 'verified';
    account.worldIdNullifier = result.nullifier;
    await account.save();
    return this.toResponse(account);
  }

  // ─── Internal helpers ───

  private toResponse(account: Account): AccountResponseDto {
    return {
      initialized: true,
      privyId: account.privyId,
      walletAddress: account.walletAddress,
      username: account.username,
      type: account.type,
      verificationStatus: account.verificationStatus,
    };
  }
}
