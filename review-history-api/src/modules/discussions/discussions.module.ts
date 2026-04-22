import { Module } from '@nestjs/common';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { ReviewStreaksModule } from '../review-streaks/review-streaks.module';

@Module({
  imports: [RealtimeModule, ReviewStreaksModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
