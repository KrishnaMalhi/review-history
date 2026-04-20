import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('Reports')
@Controller('reviews/:reviewId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a review' })
  create(
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReportDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reportsService.create(reviewId, dto, user.sub);
  }
}
