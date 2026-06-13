import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AccountType } from '../accounts/accounts.types';
import type { AuthenticatedUser } from './auth.types';
import { ROLES_KEY } from './decorators/roles.decorator';

/** Enforces @Roles(...) against the registered account type. Run after PrivyAuthGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AccountType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    if (!user?.account) {
      throw new ForbiddenException('Account is not registered.');
    }
    if (!roles.includes(user.account.type)) {
      throw new ForbiddenException(`Requires account type: ${roles.join(', ')}.`);
    }
    return true;
  }
}
