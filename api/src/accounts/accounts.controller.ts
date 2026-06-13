import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrivyAuthGuard } from '../auth/privy-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RpContextResponseDto } from '../worldid/dto/rp-context-response.dto';
import { AccountsService } from './accounts.service';
import { AccountOverviewDto } from './dto/account-overview.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { RegisterAccountDto } from './dto/register-account.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { VerifyWorldIdDto } from './dto/verify-worldid.dto';

/**
 * The World ID proof must be forwarded to the verifier byte-for-byte, so this
 * route opts out of the global whitelist (which would strip unknown fields).
 */
const worldIdProofPipe = new ValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
  transform: false,
});

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(PrivyAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get the current account',
    description:
      'Returns the registered account, or an uninitialized placeholder when the Privy user has not registered yet.',
  })
  @ApiOkResponse({ type: AccountResponseDto })
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<AccountResponseDto> {
    return this.accountsService.getMe(user.privyId);
  }

  @Get('overview')
  @ApiOperation({
    summary: 'High-level account dashboard',
    description:
      'Role-aware overview: brand spend / escrow, or clipper earnings / on-chain claimable.',
  })
  @ApiOkResponse({ type: AccountOverviewDto })
  getOverview(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AccountOverviewDto> {
    return this.accountsService.getOverview(user.privyId);
  }

  @Patch('me/username')
  @ApiOperation({ summary: 'Change the account username' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiConflictResponse({ description: 'Username is already taken.' })
  updateUsername(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUsernameDto,
  ): Promise<AccountResponseDto> {
    return this.accountsService.updateUsername(user.privyId, dto.username);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register as a Brand or Clipper',
    description:
      'Moves the account from uninitialized to a typed, unverified account.',
  })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiConflictResponse({ description: 'Account already registered.' })
  register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterAccountDto,
  ): Promise<AccountResponseDto> {
    return this.accountsService.register(user.privyId, dto);
  }

  @Get('worldid/context')
  @ApiOperation({
    summary: 'Get a signed World ID request context',
    description:
      'Returns the rp_context (and app_id/action) to pass to the IDKit widget before verifying.',
  })
  @ApiOkResponse({ type: RpContextResponseDto })
  getWorldIdContext(): RpContextResponseDto {
    return this.accountsService.getWorldIdContext();
  }

  @Post('verify-worldid')
  @ApiOperation({
    summary: 'Verify the account with World ID',
    description:
      'Submits an IDKit v4 proof to move the account to verified. The proof is verified server-side against the World developer API.',
  })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiConflictResponse({ description: 'World ID already used by another account.' })
  verifyWorldId(
    @CurrentUser() user: AuthenticatedUser,
    @Body(worldIdProofPipe) dto: VerifyWorldIdDto,
  ): Promise<AccountResponseDto> {
    return this.accountsService.verifyWorldId(user.privyId, dto);
  }
}
