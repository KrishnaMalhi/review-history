import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  Body,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAnalyticsEventDto } from './dto/log-analytics-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Public()
  @Post('entities/:entityId/page-view')
  async trackPageView(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.trackPageView(entityId, user?.sub, req.ip);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('event')
  async logEvent(@Body() dto: LogAnalyticsEventDto, @CurrentUser() user: any, @Req() req: any) {
    this.service.logEvent({
      eventType: dto.eventType,
      entityId: dto.entityId,
      inviteId: dto.inviteId,
      metadataJson: dto.metadataJson,
      userId: user?.sub,
      rawIp: req.ip,
    });
    return { accepted: true };
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
