import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.types';

/**
 * Authenticates a request via the Privy access token in the Authorization
 * header and attaches `request.user` ({ privyId, account }). The account is
 * null for users who have logged in but not yet registered (uninitialized).
 *
 * Depends only on AuthService (a globally-exported provider) so it resolves
 * correctly when applied via @UseGuards in any feature module.
 */
@Injectable()
export class PrivyAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token.');
    }

    const claims = await this.authService.verifyToken(token);
    const user: AuthenticatedUser = {
      privyId: claims.userId,
      account: await this.authService.getAccountSnapshot(claims.userId),
    };
    (request as Request & { user: AuthenticatedUser }).user = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) {
      return null;
    }
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
