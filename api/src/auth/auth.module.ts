import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { AuthService } from './auth.service';
import { PrivyAuthGuard } from './privy-auth.guard';
import { RolesGuard } from './roles.guard';
import { VerifiedGuard } from './verified.guard';

/**
 * Global auth module. Exported providers (guards, AuthService) resolve their
 * dependencies in this module's context, so feature modules can use the guards
 * with @UseGuards without re-providing them.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  providers: [AuthService, PrivyAuthGuard, RolesGuard, VerifiedGuard],
  exports: [AuthService, PrivyAuthGuard, RolesGuard, VerifiedGuard],
})
export class AuthModule {}
