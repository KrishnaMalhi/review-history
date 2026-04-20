import { Module } from '@nestjs/common';
import { CommunityValidationsService } from './community-validations.service';
import { CommunityValidationsController } from './community-validations.controller';

@Module({
  controllers: [CommunityValidationsController],
  providers: [CommunityValidationsService],
  exports: [CommunityValidationsService],
})
export class CommunityValidationsModule {}
