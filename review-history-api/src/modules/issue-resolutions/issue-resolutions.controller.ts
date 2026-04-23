import { Controller, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IssueResolutionsService } from './issue-resolutions.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Get } from '@nestjs/common';

@ApiTags('Issue Resolutions')
@ApiBearerAuth()
@Controller()
export class IssueResolutionsController {
  constructor(private readonly service: IssueResolutionsService) {}

  @Roles('claimed_owner')
  @Post('reviews/:reviewId/mark-resolved')
  async markResolved(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.markResolved(reviewId, user.sub);
  }

  @Roles('user')
  @Post('reviews/:reviewId/confirm-resolved')
  async confirmResolved(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.confirmResolved(reviewId, user.sub);
  }

  @Roles('user')
  @Post('reviews/:reviewId/dispute-resolved')
  async disputeResolution(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.disputeResolution(reviewId, user.sub);
  }

  @Roles('user')
  @Post('reviews/:reviewId/dispute-resolution')
  async disputeResolutionLegacy(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.disputeResolution(reviewId, user.sub);
  }

  @Public()
  @Get('reviews/:reviewId/resolution')
  async getResolution(@Param('reviewId', ParseUUIDPipe) reviewId: string) {
    return this.service.getByReview(reviewId);
  }
}
