import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  ACCOUNT_TYPES,
  VERIFICATION_STATUSES,
  type AccountType,
  type VerificationStatus,
} from '../accounts.types';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  @Prop({ required: true, unique: true, index: true })
  privyId!: string;

  @Prop({ required: true, lowercase: true, index: true })
  walletAddress!: string;

  /** Public display name shown instead of the wallet address. Unique. */
  @Prop({ required: true, unique: true, trim: true })
  username!: string;

  @Prop({ required: true, enum: ACCOUNT_TYPES })
  type!: AccountType;

  @Prop({
    required: true,
    enum: VERIFICATION_STATUSES,
    default: 'unverified',
  })
  verificationStatus!: VerificationStatus;

  /** World ID nullifier — unique across accounts (one person, one account). */
  @Prop({ unique: true, sparse: true })
  worldIdNullifier?: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
