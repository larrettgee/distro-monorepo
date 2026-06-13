import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from './auth.types';

/**
 * Requires the account to be World ID–verified. Run after PrivyAuthGuard.
 * Used to gate clipper actions that move funds (e.g. campaign submissions).
 */
@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    if (user?.account?.verificationStatus !== 'verified') {
      throw new ForbiddenException('World ID verification is required.');
    }
    return true;
  }
}
