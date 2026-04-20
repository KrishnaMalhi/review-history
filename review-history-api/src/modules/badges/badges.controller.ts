import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Badges')
@Controller()
export class BadgesController {
  constructor(private readonly service: BadgesService) {}

  @Public()
  @Get('entities/:entityId/badges')
  async getEntityBadges(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.service.getEntityBadges(entityId);
  }

  @Public()
  @Get('users/:userId/badges')
  async getUserBadges(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.service.getUserBadges(userId);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('admin/badges/recalculate-user/:userId')
  async recalculateUser(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.service.evaluateUserBadges(userId);
    return { message: 'Badges recalculated' };
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('admin/badges/recalculate-entity/:entityId')
  async recalculateEntity(@Param('entityId', ParseUUIDPipe) entityId: string) {
    await this.service.evaluateEntityBadges(entityId);
    return { message: 'Badges recalculated' };
  }
}
