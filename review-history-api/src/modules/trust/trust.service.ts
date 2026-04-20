import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { UserTrustLevel } from '@prisma/client';

@Injectable()
export class TrustService {
  private readonly logger = new Logger(TrustService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recalculate and update a user's trust level.
   * Factors: account age, review count, helpful votes, flagged reviews
   */
  async recalculateUserTrust(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    let score = 50; // base score

    // Account age bonus (max 10)
    const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(10, Math.floor(accountAgeDays / 30));

    // Published reviews bonus (max 15)
    const publishedReviews = await this.prisma.review.count({
      where: { authorUserId: userId, status: 'published', deletedAt: null },
    });
    score += Math.min(15, publishedReviews * 3);

    // Helpful votes bonus (max 15)
    const helpfulVotes = await this.prisma.reviewVote.count({
      where: {
        review: { authorUserId: userId },
        voteType: 'helpful',
      },
    });
    score += Math.min(15, Math.floor(helpfulVotes / 2));

    // Fake votes penalty (max -20)
    const fakeVotes = await this.prisma.reviewVote.count({
      where: {
        review: { authorUserId: userId },
        voteType: 'seems_fake',
      },
    });
    score -= Math.min(20, fakeVotes * 5);

    // Removed reviews penalty (max -20)
    const removedReviews = await this.prisma.review.count({
      where: { authorUserId: userId, status: 'removed' },
    });
    score -= Math.min(20, removedReviews * 10);

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine trust level
    let trustLevel: UserTrustLevel = 'new_user';
    if (score >= 70) trustLevel = 'trusted';
    else if (score >= 40) trustLevel = 'established';

    await this.prisma.user.update({
      where: { id: userId },
      data: { trustLevel },
    });

    return { userId, score, trustLevel };
  }

  async getEntityTrustHistory(entityId: string, limit: number = 20) {
    return this.prisma.trustScoreEvent.findMany({
      where: { entityId },
      orderBy: { effectiveAt: 'desc' },
      take: limit,
    });
  }

  async getEntityTrustSummary(entityId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
      select: {
        averageRating: true,
        ratingCount: true,
        reviewCount: true,
        trustScore: true,
        suspiciousReviewCount: true,
        hiddenReviewCount: true,
      },
    });

    const publishedReviews = await this.prisma.review.findMany({
      where: { entityId, status: 'published', deletedAt: null },
      include: { author: { select: { trustLevel: true } } },
    });

    const trustedCount = publishedReviews.filter((r) => r.author.trustLevel === 'trusted').length;
    const trustRatio = publishedReviews.length ? trustedCount / publishedReviews.length : 0;

    return {
      ...entity,
      trustedReviewerCount: trustedCount,
      trustedReviewerRatio: Math.round(trustRatio * 100),
      trustIndicator: trustRatio >= 0.5 ? 'high' : trustRatio >= 0.25 ? 'medium' : 'low',
    };
  }
}
