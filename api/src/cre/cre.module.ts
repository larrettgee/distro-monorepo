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
import { DailyBatch, DailyBatchSchema } from './schemas/daily-batch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyBatch.name, schema: DailyBatchSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    CampaignsModule,
    YoutubeModule,
  ],
  controllers: [CreController],
  providers: [CreService],
})
export class CreModule {}
