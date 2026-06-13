import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ClippersModule } from './clippers/clippers.module';
import configuration from './config/configuration';
import { CreModule } from './cre/cre.module';
import { DatabaseModule } from './database/database.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { WorldIdModule } from './worldid/worldid.module';
import { YoutubeModule } from './youtube/youtube.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    WorldIdModule,
    AccountsModule,
    BlockchainModule,
    CampaignsModule,
    ClippersModule,
    SubmissionsModule,
    LeaderboardModule,
    YoutubeModule,
    CreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
