import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CRE_DAILY_BATCH_COLLECTION } from '../cre.constants';
import type { DailyBatchPayload } from '../cre.types';

export type DailyBatchDocument = HydratedDocument<DailyBatch>;

/**
 * Persisted per-UTC-day snapshot served to the CRE. Storing it makes the batch
 * idempotent so every DON node that calls the endpoint on the same day reads an
 * identical payload (required for the workflow's identical-consensus).
 */
@Schema({ timestamps: true, collection: CRE_DAILY_BATCH_COLLECTION })
export class DailyBatch {
  @Prop({ required: true, unique: true, index: true })
  dateKey!: string;

  @Prop({ type: Object, required: true })
  payload!: DailyBatchPayload;
}

export const DailyBatchSchema = SchemaFactory.createForClass(DailyBatch);
