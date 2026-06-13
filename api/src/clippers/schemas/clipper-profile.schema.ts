import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClipperProfileDocument = HydratedDocument<ClipperProfile>;

/** A single verified social channel owned by the clipper. */
@Schema({ _id: false })
export class ConnectedChannel {
  /** Platform the channel belongs to. Only `youtube` is connectable today. */
  @Prop({ required: true, default: 'youtube' })
  platform!: string;

  /** Platform-native channel id (unique per platform). */
  @Prop({ required: true })
  channelId!: string;

  /** Public @handle / custom url, when available. */
  @Prop()
  handle?: string;

  /** Display name of the channel at connect time. */
  @Prop()
  title?: string;

  /** Avatar/thumbnail url at connect time. */
  @Prop()
  thumbnailUrl?: string;

  @Prop({ required: true })
  connectedAt!: Date;
}

export const ConnectedChannelSchema =
  SchemaFactory.createForClass(ConnectedChannel);

@Schema({ timestamps: true, collection: 'clipper_profiles' })
export class ClipperProfile {
  @Prop({ required: true, unique: true, index: true })
  privyId!: string;

  /** Every verified channel the clipper has connected. */
  @Prop({ type: [ConnectedChannelSchema], default: [] })
  channels!: ConnectedChannel[];

  // ─── Legacy single-channel fields (pre-`channels[]`) ───
  // Read-only: migrated into `channels` on next access, then cleared.
  @Prop()
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

// Fast membership lookups + cross-account uniqueness of a connected channel.
ClipperProfileSchema.index({ 'channels.channelId': 1 });
