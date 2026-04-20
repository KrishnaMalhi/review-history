import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ResponseMetricsService {
  private readonly logger = new Logger(ResponseMetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getByEntity(entityId: string) {
    const metric = await this.prisma.entityResponseMetric.findUnique({
      where: { entityId },
    });
    if (!metric) return this.defaultMetrics();
    return this.mapMetric(metric);
  }

  async recalculate(entityId: string) {
    // Count total published reviews
    const totalReviews = await this.prisma.review.count({
      where: { entityId, status: 'published', deletedAt: null },
    });

    // Count reviews with at least one published reply from claimed_owner
    const repliedReviews = await this.prisma.review.count({
      where: {
        entityId,
        status: 'published',
        deletedAt: null,
        replies: {
          some: { authorRole: 'claimed_owner', status: 'published' },
        },
      },
    });

    // Calculate response rate
    const responseRate = totalReviews > 0 ? (repliedReviews / totalReviews) * 100 : 0;

    // Calculate average response time: avg(first_reply.createdAt - review.publishedAt)
    const reviewsWithReplies = await this.prisma.review.findMany({
      where: {
        entityId,
        status: 'published',
        deletedAt: null,
        replies: { some: { authorRole: 'claimed_owner', status: 'published' } },
      },
      select: {
        publishedAt: true,
        replies: {
          where: { authorRole: 'claimed_owner', status: 'published' },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    let avgResponseTimeHours = 0;
    if (reviewsWithReplies.length > 0) {
      const totalHours = reviewsWithReplies.reduce((sum, r) => {
        if (r.publishedAt && r.replies[0]) {
          const diff = r.replies[0].createdAt.getTime() - r.publishedAt.getTime();
          return sum + diff / (1000 * 60 * 60);
        }
        return sum;
      }, 0);
      avgResponseTimeHours = totalHours / reviewsWithReplies.length;
    }

    // Count confirmed resolved issues
    const issuesResolvedCount = await this.prisma.issueResolution.count({
      where: {
        review: { entityId },
        status: 'confirmed_resolved',
      },
    });

    // Find last reply time
    const lastReply = await this.prisma.reviewReply.findFirst({
      where: {
        review: { entityId },
        authorRole: 'claimed_owner',
        status: 'published',
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Upsert metric
    const metric = await this.prisma.entityResponseMetric.upsert({
      where: { entityId },
      update: {
        totalReviews,
        repliedReviews,
        responseRate,
        avgResponseTimeHours,
        issuesResolvedCount,
        lastRepliedAt: lastReply?.createdAt || null,
        recalculatedAt: new Date(),
      },
      create: {
        entityId,
        totalReviews,
        repliedReviews,
        responseRate,
        avgResponseTimeHours,
        issuesResolvedCount,
        lastRepliedAt: lastReply?.createdAt || null,
      },
    });

    // Evaluate badges based on metrics
    await this.evaluateEntityBadges(entityId, metric);

    return this.mapMetric(metric);
  }

  private async evaluateEntityBadges(entityId: string, metric: any) {
    const responseRate = Number(metric.responseRate);
    const avgTime = Number(metric.avgResponseTimeHours);
    const total = metric.totalReviews;

    // Fast Responder: avg < 24h AND rate > 50% AND 5+ reviews
    await this.upsertBadgeConditional(
      entityId,
      'fast_responder',
      avgTime < 24 && responseRate > 50 && total >= 5,
    );

    // Responsive Employer: rate > 80% AND 10+ reviews
    await this.upsertBadgeConditional(
      entityId,
      'responsive_employer',
      responseRate > 80 && total >= 10,
    );
  }

  private async upsertBadgeConditional(entityId: string, badgeType: any, condition: boolean) {
    if (condition) {
      await this.prisma.badge.upsert({
        where: {
          badgeType_targetType_targetId: {
            badgeType,
            targetType: 'entity',
            targetId: entityId,
          },
        },
        update: { awardedAt: new Date() },
        create: { badgeType, targetType: 'entity', targetId: entityId },
      });
    } else {
      await this.prisma.badge.deleteMany({
        where: { badgeType, targetType: 'entity', targetId: entityId },
      });
    }
  }

  private defaultMetrics() {
    return {
      totalReviews: 0,
      repliedReviews: 0,
      responseRate: 0,
      avgResponseTimeHours: 0,
      issuesResolvedCount: 0,
      lastRepliedAt: null,
    };
  }

  private mapMetric(metric: any) {
    return {
      totalReviews: metric.totalReviews,
      repliedReviews: metric.repliedReviews,
      responseRate: Number(metric.responseRate),
      avgResponseTimeHours: Number(metric.avgResponseTimeHours),
      issuesResolvedCount: metric.issuesResolvedCount,
      lastRepliedAt: metric.lastRepliedAt,
    };
  }
}
