import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { sanitizeInput } from '../../common/utils/helpers';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(reviewId: string, dto: CreateReportDto, userId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Prevent duplicate reports
    const existing = await this.prisma.reviewReport.findFirst({
      where: { reviewId, reporterUserId: userId },
    });
    if (existing) {
      throw new ConflictException('You have already reported this review');
    }

    const report = await this.prisma.reviewReport.create({
      data: {
        reviewId,
        reporterUserId: userId,
        reportType: dto.reportType,
        reasonText: dto.description ? sanitizeInput(dto.description) : null,
      },
    });

    // Auto-create moderation case if report count threshold reached
    const reportCount = await this.prisma.reviewReport.count({ where: { reviewId } });
    if (reportCount >= 3) {
      const existingCase = await this.prisma.moderationCase.findFirst({
        where: { objectId: reviewId, objectType: 'review', status: { notIn: ['resolved', 'closed'] } },
      });
      if (!existingCase) {
        await this.prisma.moderationCase.create({
          data: {
            objectType: 'review',
            objectId: reviewId,
            triggerType: 'user_report_threshold',
            severity: 'medium',
          },
        });
        this.logger.log(`Moderation case created for review ${reviewId} — ${reportCount} reports`);
      }
    }

    return { reportId: report.id, message: 'Report submitted successfully' };
  }
}
