import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { CategoryExtensionsModule } from '../category-extensions/category-extensions.module';
import { ReviewStreaksModule } from '../review-streaks/review-streaks.module';
import { ReviewQualityModule } from '../review-quality/review-quality.module';
import { BadgesModule } from '../badges/badges.module';
import { ResponseMetricsModule } from '../response-metrics/response-metrics.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    CategoryExtensionsModule,
    ReviewStreaksModule,
    ReviewQualityModule,
    BadgesModule,
    ResponseMetricsModule,
    RealtimeModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
