import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiscussionsService } from './discussions.service';
import { ListDiscussionsDto } from './dto/list-discussions.dto';
import { Public, CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { ReactDiscussionDto } from './dto/react-discussion.dto';
import { CreateDiscussionCommentDto } from './dto/create-discussion-comment.dto';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly service: DiscussionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public list discussions' })
  list(@Query() query: ListDiscussionsDto) {
    return this.service.list(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List discussions including my reaction' })
  listWithMyReaction(@Query() query: ListDiscussionsDto, @CurrentUser() user: JwtPayload) {
    return this.service.list(query, user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'claimed_owner', 'admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create discussion post' })
  create(@Body() dto: CreateDiscussionDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'claimed_owner', 'admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like/dislike discussion' })
  react(
    @Param('id') discussionId: string,
    @Body() dto: ReactDiscussionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.react(discussionId, dto, user.sub);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'claimed_owner', 'admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on discussion' })
  comment(
    @Param('id') discussionId: string,
    @Body() dto: CreateDiscussionCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.addComment(discussionId, dto, user.sub);
  }
}
