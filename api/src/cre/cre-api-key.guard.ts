import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppConfig } from '../config/configuration';
import { CRE_API_KEY_HEADER } from './cre.constants';

/**
 * Authenticates machine-to-machine CRE requests via a shared secret in the
 * `x-cre-api-key` header. Used instead of Privy auth because the caller is the
 * Chainlink CRE workflow, not an end user.
 */
@Injectable()
export class CreApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get('cre.apiKey', { infer: true });
    if (!expected) {
      throw new UnauthorizedException('CRE API key is not configured.');
    }
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers[CRE_API_KEY_HEADER];
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid CRE API key.');
    }
    return true;
  }
}
