import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClipperProfileDocument = HydratedDocument<ClipperProfile>;

@Schema({ timestamps: true, collection: 'clipper_profiles' })
export class ClipperProfile {
  @Prop({ required: true, unique: true, index: true })
  privyId!: string;

  /** Set once the channel is verified via the bio code. */
  @Prop({ index: true })
  youtubeChannelId?: string;

  @Prop()
  youtubeHandle?: string;

  @Prop()
  connectedAt?: Date;

  /** Pending connection: the code the clipper must paste into their YT bio. */
  @Prop()
  pendingCode?: string;

  /** The channel URL/handle the pending code is for. */
  @Prop()
  pendingChannelRef?: string;
}

export const ClipperProfileSchema =
  SchemaFactory.createForClass(ClipperProfile);
