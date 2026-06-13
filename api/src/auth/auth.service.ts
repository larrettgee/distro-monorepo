import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { type AuthTokenClaims, PrivyClient } from '@privy-io/server-auth';
import { Model } from 'mongoose';
import {
  Account,
  type AccountDocument,
} from '../accounts/schemas/account.schema';
import type { AppConfig } from '../config/configuration';
import type { AccountSnapshot } from './auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly privy: PrivyClient;

  constructor(
    config: ConfigService<AppConfig, true>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {
    this.privy = new PrivyClient(
      config.get('privy.appId', { infer: true }),
      config.get('privy.appSecret', { infer: true }),
    );
  }

  /** Load a minimal account view for the request, or null if unregistered. */
  async getAccountSnapshot(privyId: string): Promise<AccountSnapshot | null> {
    const account = await this.accountModel
      .findOne({ privyId })
      .lean()
      .exec();
    if (!account) {
      return null;
    }
    return {
      privyId: account.privyId,
      walletAddress: account.walletAddress,
      username: account.username,
      type: account.type,
      verificationStatus: account.verificationStatus,
    };
  }

  /** Verify a Privy access token; throws 401 if invalid/expired. */
  async verifyToken(token: string): Promise<AuthTokenClaims> {
    try {
      return await this.privy.verifyAuthToken(token);
    } catch (error) {
      this.logger.warn(`Privy token verification failed: ${String(error)}`);
      throw new UnauthorizedException('Invalid or expired Privy token.');
    }
  }

  /** Resolve the embedded/linked wallet address for a Privy user (lowercased). */
  async getWalletAddress(privyId: string): Promise<string> {
    const user = await this.privy.getUser(privyId);
    const address = user.wallet?.address;
    if (!address) {
      throw new BadRequestException(
        'No wallet is linked to this Privy account.',
      );
    }
    return address.toLowerCase();
  }
}
