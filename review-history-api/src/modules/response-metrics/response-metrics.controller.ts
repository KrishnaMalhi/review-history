import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseMetricsService } from './response-metrics.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Response Metrics')
@Controller()
export class ResponseMetricsController {
  constructor(private readonly service: ResponseMetricsService) {}

  @Public()
  @Get('entities/:entityId/response-metrics')
  async getByEntity(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.service.getByEntity(entityId);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('admin/response-metrics/recalculate/:entityId')
  async recalculate(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.service.recalculate(entityId);
  }
}
