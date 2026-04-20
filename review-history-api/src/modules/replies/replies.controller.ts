import { Controller, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('Replies')
@Controller()
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post('reviews/:reviewId/replies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a review' })
  create(
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.repliesService.create(reviewId, dto, user.sub, user.role);
  }

  @Delete('replies/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reply' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.repliesService.softDelete(id, user.sub, user.role);
  }
}
