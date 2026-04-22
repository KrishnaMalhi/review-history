import { Module } from '@nestjs/common';
import { CommunityValidationsService } from './community-validations.service';
import { CommunityValidationsController } from './community-validations.controller';
import { ReviewStreaksModule } from '../review-streaks/review-streaks.module';

@Module({
  imports: [ReviewStreaksModule],
  controllers: [CommunityValidationsController],
  providers: [CommunityValidationsService],
  exports: [CommunityValidationsService],
})
export class CommunityValidationsModule {}
