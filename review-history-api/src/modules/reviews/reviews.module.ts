import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { CategoryExtensionsModule } from '../category-extensions/category-extensions.module';
import { ReviewStreaksModule } from '../review-streaks/review-streaks.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ReviewInvitesModule } from '../review-invites/review-invites.module';

@Module({
  imports: [
    CategoryExtensionsModule,
    ReviewStreaksModule,
    RealtimeModule,
    ReviewInvitesModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
