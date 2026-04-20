import { Module } from '@nestjs/common';
import { EmployerProfilesService } from './employer-profiles.service';
import { EmployerProfilesController } from './employer-profiles.controller';

@Module({
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService],
  exports: [EmployerProfilesService],
})
export class EmployerProfilesModule {}
