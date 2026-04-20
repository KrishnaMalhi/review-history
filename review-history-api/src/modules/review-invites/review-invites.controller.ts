import { Controller, Get, Post, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewInvitesService } from './review-invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Review Invites')
@Controller()
export class ReviewInvitesController {
  constructor(private readonly service: ReviewInvitesService) {}

  @ApiBearerAuth()
  @Roles('claimed_owner')
  @Post('entities/:entityId/invites')
  async create(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(entityId, dto, user.sub);
  }

  @ApiBearerAuth()
  @Roles('claimed_owner')
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
  async resolveToken(@Param('token') token: string) {
    return this.service.resolveToken(token);
  }
}
