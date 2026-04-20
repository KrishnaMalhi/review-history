import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { AdminListReviewsDto } from './dto/admin-list-reviews.dto';
import { AdminUpdateReviewStatusDto } from './dto/admin-update-review-status.dto';
import { ReviewFeedQueryDto } from './dto/review-feed-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload, Public, Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('entities/:entityId/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for an entity' })
  create(
    @Param('entityId') entityId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reviewsService.create(entityId, dto, user.sub);
  }

  @Public()
  @Get('entities/:entityId/reviews')
  @ApiOperation({ summary: 'List reviews for an entity' })
  findByEntity(@Param('entityId') entityId: string, @Query() query: ListReviewsDto) {
    return this.reviewsService.findByEntity(entityId, query);
  }

  @Public()
  @Get('reviews/feed')
  @ApiOperation({ summary: 'Public feed of recent reviews across all entities' })
  getFeed(@Query() query: ReviewFeedQueryDto) {
    return this.reviewsService.getFeed(query.page, query.pageSize, query.category, query.sort, query.rating);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a review (within 48h window)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reviewsService.update(id, dto, user.sub);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.reviewsService.softDelete(id, user.sub, user.role);
  }

  @Get('me/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s reviews' })
  getMyReviews(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.reviewsService.getUserReviews(user.sub, query.page, query.pageSize);
  }

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list reviews' })
  adminList(
    @Query() query: AdminListReviewsDto,
  ) {
    return this.reviewsService.adminListReviews(query.page, query.pageSize, query.status, query.q);
  }

  @Get('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get review detail' })
  adminGet(@Param('id') id: string) {
    return this.reviewsService.adminGetReview(id);
  }

  @Patch('admin/reviews/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update review status' })
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateReviewStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reviewsService.adminUpdateReviewStatus(id, dto.status, user.sub);
  }
}
