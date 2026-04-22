import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { MailerService } from '../../common/mailer/mailer.service';

const LEGAL_REPORT_TYPES = new Set(['threatening_content', 'harassment', 'personal_information']);

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

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
        // Notify legal team when moderation case is auto-created
        await this.mailer.sendLegalAlert({
          subject: `Auto-moderation case opened — ${reportCount} reports`,
          reviewId,
          reportType: dto.reportType,
          description: dto.description,
          reporterUserId: userId,
          reviewBody: review.body,
        });
      }
    }

    // Immediate legal alert for severe report types (even before threshold)
    if (LEGAL_REPORT_TYPES.has(dto.reportType)) {
      await this.mailer.sendLegalAlert({
        subject: `High-severity report: ${dto.reportType}`,
        reviewId,
        reportType: dto.reportType,
        description: dto.description,
        reporterUserId: userId,
        reviewBody: review.body,
      });
    }

    return { reportId: report.id, message: 'Report submitted successfully' };
  }
}
