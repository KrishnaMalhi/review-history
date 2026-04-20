import { Module } from '@nestjs/common';
import { ResponseTemplatesService } from './response-templates.service';
import { ResponseTemplatesController } from './response-templates.controller';

@Module({
  controllers: [ResponseTemplatesController],
  providers: [ResponseTemplatesService],
  exports: [ResponseTemplatesService],
})
export class ResponseTemplatesModule {}
