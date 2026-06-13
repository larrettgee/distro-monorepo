import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length, Matches } from 'class-validator';
import {
  ACCOUNT_TYPES,
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_PATTERN,
  type AccountType,
} from '../accounts.types';

export class RegisterAccountDto {
  @ApiProperty({
    description: 'Account type to register as.',
    enum: ACCOUNT_TYPES,
  })
  @IsIn(ACCOUNT_TYPES)
  type!: AccountType;

  @ApiProperty({
    description: 'Public username (letters, numbers, underscore).',
    minLength: USERNAME_MIN,
    maxLength: USERNAME_MAX,
  })
  @IsString()
  @Length(USERNAME_MIN, USERNAME_MAX)
  @Matches(USERNAME_PATTERN, {
    message: 'username may only contain letters, numbers, and underscores',
  })
  username!: string;
}
