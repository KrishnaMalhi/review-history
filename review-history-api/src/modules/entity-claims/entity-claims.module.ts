import { Module } from '@nestjs/common';
import { EntityClaimsService } from './entity-claims.service';
import { EntityClaimsController } from './entity-claims.controller';

@Module({
  controllers: [EntityClaimsController],
  providers: [EntityClaimsService],
  exports: [EntityClaimsService],
})
export class EntityClaimsModule {}
