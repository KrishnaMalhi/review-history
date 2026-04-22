import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { ReviewStreaksModule } from '../review-streaks/review-streaks.module';

@Module({
  imports: [ReviewStreaksModule],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
