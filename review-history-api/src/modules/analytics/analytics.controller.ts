import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Public()
  @Post('entities/:entityId/page-view')
  async trackPageView(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.trackPageView(entityId, user?.sub);
  }

  @Roles('claimed_owner')
  @Get('entities/:entityId/dashboard')
  async getEntityDashboard(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query('days') days?: string,
  ) {
    return this.service.getEntityDashboard(entityId, days ? parseInt(days, 10) : 30);
  }

  @Roles('admin')
  @Get('entities/:entityId/views')
  async getEntityViews(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query('days') days?: string,
  ) {
    return this.service.getEntityPageViews(entityId, days ? parseInt(days, 10) : 30);
  }
}
