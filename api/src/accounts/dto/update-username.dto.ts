import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import {
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_PATTERN,
} from '../accounts.types';

export class UpdateUsernameDto {
  @ApiProperty({
    description: 'New public username (letters, numbers, underscore).',
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
