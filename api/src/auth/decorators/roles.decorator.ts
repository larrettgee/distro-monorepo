import { SetMetadata } from '@nestjs/common';
import type { AccountType } from '../../accounts/accounts.types';

export const ROLES_KEY = 'roles';

/** Restrict a route to the given account type(s). Requires RolesGuard. */
export const Roles = (...roles: AccountType[]) => SetMetadata(ROLES_KEY, roles);
