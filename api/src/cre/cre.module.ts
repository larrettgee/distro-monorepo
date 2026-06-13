import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsModule } from '../campaigns/campaigns.module';
import {
  Submission,
  SubmissionSchema,
} from '../submissions/schemas/submission.schema';
import { YoutubeModule } from '../youtube/youtube.module';
import { CreController } from './cre.controller';
import { CreService } from './cre.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    CampaignsModule,
    YoutubeModule,
  ],
  controllers: [CreController],
  providers: [CreService],
})
export class CreModule {}
