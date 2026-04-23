import { Module } from '@nestjs/common';
import { EmployerProfilesService } from './employer-profiles.service';
import { EmployerProfilesController } from './employer-profiles.controller';
import { EntityOwnerGuard } from '../../common/guards/entity-owner.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService, EntityOwnerGuard],
  exports: [EmployerProfilesService],
})
export class EmployerProfilesModule {}
