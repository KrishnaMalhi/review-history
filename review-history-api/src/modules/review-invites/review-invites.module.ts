import { Module } from '@nestjs/common';
import { ReviewInvitesService } from './review-invites.service';
import { ReviewInvitesController } from './review-invites.controller';

@Module({
  controllers: [ReviewInvitesController],
  providers: [ReviewInvitesService],
  exports: [ReviewInvitesService],
})
export class ReviewInvitesModule {}
