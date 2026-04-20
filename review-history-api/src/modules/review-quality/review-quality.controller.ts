import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ReviewQualityService } from './review-quality.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('review-quality')
export class ReviewQualityController {
  constructor(private readonly service: ReviewQualityService) {}

  @Public()
  @Get('reviews/:reviewId')
  async getScore(@Param('reviewId', ParseUUIDPipe) reviewId: string) {
    return this.service.getScore(reviewId);
  }

  @Roles('admin')
  @Post('reviews/:reviewId/recalculate')
  async recalculate(@Param('reviewId', ParseUUIDPipe) reviewId: string) {
    return this.service.calculateScore(reviewId);
  }

  @Roles('admin')
  @Post('entities/:entityId/batch-recalculate')
  async batchRecalculate(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.batchRecalculate(entityId, limit ? parseInt(limit, 10) : 100);
  }
}
