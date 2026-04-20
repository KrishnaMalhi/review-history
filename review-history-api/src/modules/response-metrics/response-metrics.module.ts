import { Module } from '@nestjs/common';
import { ResponseMetricsService } from './response-metrics.service';
import { ResponseMetricsController } from './response-metrics.controller';

@Module({
  controllers: [ResponseMetricsController],
  providers: [ResponseMetricsService],
  exports: [ResponseMetricsService],
})
export class ResponseMetricsModule {}
