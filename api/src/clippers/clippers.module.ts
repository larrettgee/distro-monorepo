import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YoutubeModule } from '../youtube/youtube.module';
import { ClippersController } from './clippers.controller';
import { ClippersService } from './clippers.service';
import {
  ClipperProfile,
  ClipperProfileSchema,
} from './schemas/clipper-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClipperProfile.name, schema: ClipperProfileSchema },
    ]),
    YoutubeModule,
  ],
  controllers: [ClippersController],
  providers: [ClippersService],
  exports: [ClippersService],
})
export class ClippersModule {}
