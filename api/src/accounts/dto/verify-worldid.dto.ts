import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * IDKit v4 proof payload. Validated loosely and forwarded VERBATIM to the World
 * verifier — the verify route uses a permissive pipe (whitelist disabled) so
 * extra fields (e.g. integrity_bundle) are preserved, not stripped.
 */
class WorldIdResponseItemDto {
  @ApiProperty({ example: 'proof_of_human' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signal_hash?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  proof!: string[];

  @ApiProperty({ description: 'RP-scoped nullifier (hex).' })
  @IsString()
  @IsNotEmpty()
  nullifier!: string;

  @ApiProperty()
  @IsNumber()
  issuer_schema_id!: number;

  @ApiProperty()
  @IsNumber()
  expires_at_min!: number;
}

export class VerifyWorldIdDto {
  @ApiProperty({ example: '4.0' })
  @IsString()
  @IsNotEmpty()
  protocol_version!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nonce!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action!: string;

  @ApiProperty({ enum: ['production', 'staging'] })
  @IsString()
  @IsNotEmpty()
  environment!: string;

  @ApiProperty({ type: [WorldIdResponseItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorldIdResponseItemDto)
  responses!: WorldIdResponseItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  user_presence_completed?: boolean;
}
