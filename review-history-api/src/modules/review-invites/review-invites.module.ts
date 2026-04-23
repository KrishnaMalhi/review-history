import { Module } from '@nestjs/common';
import { ReviewInvitesService } from './review-invites.service';
import { ReviewInvitesController } from './review-invites.controller';
import { EntityOwnerGuard } from '../../common/guards/entity-owner.guard';

@Module({
  controllers: [ReviewInvitesController],
  providers: [ReviewInvitesService, EntityOwnerGuard],
  exports: [ReviewInvitesService],
})
export class ReviewInvitesModule {}
