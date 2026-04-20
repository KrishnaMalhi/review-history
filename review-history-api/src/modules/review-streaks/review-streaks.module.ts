import { Module } from '@nestjs/common';
import { ReviewStreaksService } from './review-streaks.service';
import { ReviewStreaksController } from './review-streaks.controller';

@Module({
  controllers: [ReviewStreaksController],
  providers: [ReviewStreaksService],
  exports: [ReviewStreaksService],
})
export class ReviewStreaksModule {}
