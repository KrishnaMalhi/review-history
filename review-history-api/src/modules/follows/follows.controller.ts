import { Controller, Get, Post, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Follows')
@Controller()
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @ApiBearerAuth()
  @Roles('user')
  @Post('follows')
  async create(@Body() dto: CreateFollowDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @ApiBearerAuth()
  @Roles('user')
  @Delete('follows/:targetType/:targetId')
  async remove(
    @Param('targetType') targetType: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.remove(targetType, targetId, user.sub);
  }

  @ApiBearerAuth()
  @Roles('user')
  @Get('me/follows')
  async getMyFollows(@CurrentUser() user: JwtPayload) {
    return this.service.getMyFollows(user.sub);
  }

  @Public()
  @Get('entities/:entityId/followers/count')
  async getFollowerCount(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.service.getFollowerCount(entityId);
  }
}
