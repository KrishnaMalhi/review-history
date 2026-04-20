import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { BadgeType } from '@prisma/client';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getEntityBadges(entityId: string) {
    const badges = await this.prisma.badge.findMany({
      where: { targetType: 'entity', targetId: entityId },
      orderBy: { awardedAt: 'desc' },
    });
    return badges.map((b) => ({
      badgeType: b.badgeType,
      awardedAt: b.awardedAt,
      expiresAt: b.expiresAt,
    }));
  }

  async getUserBadges(userId: string) {
    const badges = await this.prisma.badge.findMany({
      where: { targetType: 'user', targetId: userId },
      orderBy: { awardedAt: 'desc' },
    });
    return badges.map((b) => ({
      badgeType: b.badgeType,
      awardedAt: b.awardedAt,
      expiresAt: b.expiresAt,
    }));
  }

  async evaluateUserBadges(userId: string) {
    // Count published reviews
    const reviewCount = await this.prisma.review.count({
      where: { authorUserId: userId, status: 'published', deletedAt: null },
    });

    // Count helpful votes received
    const helpfulVotes = await this.prisma.reviewVote.count({
      where: {
        review: { authorUserId: userId },
        voteType: 'helpful',
      },
    });

    // Get user trust level
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustLevel: true },
    });

    const isTrusted = user?.trustLevel === 'trusted';

    // Permanent milestones
    await this.upsertBadge('user', userId, 'first_review', reviewCount >= 1);
    await this.upsertBadge('user', userId, 'five_reviews', reviewCount >= 5);
    await this.upsertBadge('user', userId, 'ten_reviews', reviewCount >= 10);
    await this.upsertBadge('user', userId, 'twenty_five_reviews', reviewCount >= 25);

    // Conditional badges (can be revoked)
    await this.upsertBadge('user', userId, 'top_contributor', reviewCount >= 20 && isTrusted);
    await this.upsertBadge('user', userId, 'trusted_reviewer', isTrusted && helpfulVotes >= 10);

    // Check streak badges
    const streak = await this.prisma.reviewStreak.findUnique({
      where: { userId },
    });
    if (streak) {
      await this.upsertBadge('user', userId, 'streak_7', streak.longestStreak >= 7);
      await this.upsertBadge('user', userId, 'streak_30', streak.longestStreak >= 30);
    }

    // Check quality reviewer badge
    const qualityReviews = await this.prisma.reviewQualityScore.count({
      where: {
        review: { authorUserId: userId },
        totalScore: { gte: 0.7 },
      },
    });
    await this.upsertBadge('user', userId, 'quality_reviewer', qualityReviews >= 5);
  }

  async evaluateEntityBadges(entityId: string) {
    // Employee trusted badge: avg workplace rating > 3.5 AND 10+ workplace reviews
    const workplaceStats = await this.prisma.workplaceReviewData.aggregate({
      where: { review: { entityId, status: 'published', deletedAt: null } },
      _avg: { workCulture: true, salaryFairness: true, managementQuality: true },
      _count: true,
    });

    if (workplaceStats._count >= 10) {
      const avgRating =
        ((workplaceStats._avg.workCulture || 0) +
          (workplaceStats._avg.salaryFairness || 0) +
          (workplaceStats._avg.managementQuality || 0)) /
        3;
      await this.upsertBadge('entity', entityId, 'employee_trusted', avgRating > 3.5);
    }
  }

  private async upsertBadge(
    targetType: string,
    targetId: string,
    badgeType: BadgeType,
    condition: boolean,
  ) {
    if (condition) {
      await this.prisma.badge.upsert({
        where: {
          badgeType_targetType_targetId: { badgeType, targetType, targetId },
        },
        update: {},
        create: { badgeType, targetType, targetId },
      });
    } else {
      // Don't revoke permanent badges
      const permanentBadges: BadgeType[] = [
        'first_review',
        'five_reviews',
        'ten_reviews',
        'twenty_five_reviews',
      ];
      if (!permanentBadges.includes(badgeType)) {
        await this.prisma.badge.deleteMany({
          where: { badgeType, targetType, targetId },
        });
      }
    }
  }
}
