import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { ReviewStreaksModule } from '../review-streaks/review-streaks.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [ReviewStreaksModule, RealtimeModule],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
