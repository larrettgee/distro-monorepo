import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  SUBMISSION_STATUSES,
  type SubmissionStatus,
} from '../submissions.types';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: true, collection: 'submissions' })
export class Submission {
  @Prop({ required: true, index: true })
  campaignId!: string;

  @Prop({ required: true, index: true })
  clipperPrivyId!: string;

  @Prop({ required: true, lowercase: true })
  clipperWallet!: string;

  @Prop({ required: true })
  videoId!: string;

  @Prop({ required: true })
  videoUrl!: string;

  /** YouTube channel that published the clip (must match the clipper's). */
  @Prop({ required: true })
  channelId!: string;

  @Prop({
    required: true,
    enum: SUBMISSION_STATUSES,
    default: 'pending',
  })
  status!: SubmissionStatus;

  @Prop()
  lastViewCount?: number;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
// One submission of a given video per campaign.
SubmissionSchema.index({ campaignId: 1, videoId: 1 }, { unique: true });
