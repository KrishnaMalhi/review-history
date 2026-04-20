import { Module } from '@nestjs/common';
import { ReviewQualityService } from './review-quality.service';
import { ReviewQualityController } from './review-quality.controller';

@Module({
  controllers: [ReviewQualityController],
  providers: [ReviewQualityService],
  exports: [ReviewQualityService],
})
export class ReviewQualityModule {}
