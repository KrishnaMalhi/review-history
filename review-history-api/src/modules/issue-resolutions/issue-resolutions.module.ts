import { Module } from '@nestjs/common';
import { IssueResolutionsService } from './issue-resolutions.service';
import { IssueResolutionsController } from './issue-resolutions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [IssueResolutionsController],
  providers: [IssueResolutionsService],
  exports: [IssueResolutionsService],
})
export class IssueResolutionsModule {}
