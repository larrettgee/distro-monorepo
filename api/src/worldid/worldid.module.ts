import { Module } from '@nestjs/common';
import { WorldIdService } from './worldid.service';

@Module({
  providers: [WorldIdService],
  exports: [WorldIdService],
})
export class WorldIdModule {}
