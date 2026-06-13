import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { WorldIdService } from '../worldid/worldid.service';
import type { WorldIdProof, WorldIdRpContext } from '../worldid/worldid.types';
import { AccountResponseDto } from './dto/account-response.dto';
import { RegisterAccountDto } from './dto/register-account.dto';
import { VerifyWorldIdDto } from './dto/verify-worldid.dto';
import { Account, type AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    private readonly authService: AuthService,
    private readonly worldIdService: WorldIdService,
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
