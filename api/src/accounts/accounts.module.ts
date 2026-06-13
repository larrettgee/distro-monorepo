import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorldIdModule } from '../worldid/worldid.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import {
  Submission,
  SubmissionSchema,
} from '../submissions/schemas/submission.schema';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account, AccountSchema } from './schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    WorldIdModule,
    BlockchainModule,
    CampaignsModule,
    LeaderboardModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
