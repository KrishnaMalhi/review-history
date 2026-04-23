import { Module } from '@nestjs/common';
import { EntityClaimsService } from './entity-claims.service';
import { EntityClaimsController } from './entity-claims.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EntityClaimsController],
  providers: [EntityClaimsService],
  exports: [EntityClaimsService],
})
export class EntityClaimsModule {}
