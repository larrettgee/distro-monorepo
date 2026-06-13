import { ApiProperty } from '@nestjs/swagger';
import type { AccountType, VerificationStatus } from '../accounts.types';

export class AccountResponseDto {
  @ApiProperty({
    description: 'False when the user is logged in via Privy but has no account yet.',
  })
  initialized!: boolean;

  @ApiProperty({ description: 'Privy DID.' })
  privyId!: string;

  @ApiProperty({ description: 'Linked wallet address.', nullable: true })
  walletAddress!: string | null;

  @ApiProperty({ description: 'Public username. Null when uninitialized.', nullable: true })
  username!: string | null;

  @ApiProperty({
    description: 'Account type. Null when uninitialized.',
    enum: ['brand', 'clipper'],
    nullable: true,
  })
  type!: AccountType | null;

  @ApiProperty({
    description: 'World ID verification status. Null when uninitialized.',
    enum: ['unverified', 'verified'],
    nullable: true,
  })
  verificationStatus!: VerificationStatus | null;
}
