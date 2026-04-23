import { Controller, Get, Post, Patch, Param, Body, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewInvitesService } from './review-invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { EntityOwnerGuard } from '../../common/guards/entity-owner.guard';

@ApiTags('Review Invites')
@Controller()
export class ReviewInvitesController {
  constructor(private readonly service: ReviewInvitesService) {}

  @ApiBearerAuth()
  @UseGuards(EntityOwnerGuard)
  @Post('entities/:entityId/invites')
  async create(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(entityId, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(EntityOwnerGuard)
  @Get('entities/:entityId/invites')
  async listByEntity(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByEntity(entityId, user.sub);
  }

  @ApiBearerAuth()
  @Roles('claimed_owner')
  @Patch('invites/:inviteId/revoke')
  async revoke(
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.revoke(inviteId, user.sub);
  }

  @Public()
  @Throttle({ default: { ttl: 3600000, limit: 50 } })
  @Get('r/:token')
  async resolveToken(@Param('token') token: string, @Req() req: any) {
    const forwardedIp = req.headers?.['x-forwarded-for'];
    const ip = Array.isArray(forwardedIp)
      ? forwardedIp[0]
      : typeof forwardedIp === 'string'
        ? forwardedIp.split(',')[0]?.trim()
        : req.ip;
    return this.service.resolveToken(token, ip);
  }
}
