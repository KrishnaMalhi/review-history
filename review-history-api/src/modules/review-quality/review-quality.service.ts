import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReviewQualityService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateScore(reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
      include: {
        tagLinks: true,
        author: { select: { trustLevel: true, createdAt: true } },
      },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Length score (0-1.0): based on body length
    const bodyLen = review.body?.length || 0;
    let lengthScore: number;
    if (bodyLen >= 200) lengthScore = 1.0;
    else if (bodyLen >= 100) lengthScore = 0.75;
    else if (bodyLen >= 50) lengthScore = 0.5;
    else lengthScore = 0.25;

    // Detail score (0-1.0): title + tags
    let detailScore = 0;
    if (review.title && review.title.length > 3) detailScore += 0.5;
    const tagCount = review.tagLinks.length;
    if (tagCount >= 3) detailScore += 0.5;
    else if (tagCount >= 1) detailScore += 0.25;

    // Balance score (0-1.0): trust level + account age
    const accountAgeDays =
      (Date.now() - review.author.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    let balanceScore = 0;
    const trustLevel = review.author.trustLevel;
    if (trustLevel >= 'verified') balanceScore += 0.5;
    else if (trustLevel >= 'basic') balanceScore += 0.25;
    if (accountAgeDays >= 30) balanceScore += 0.5;
    else if (accountAgeDays >= 7) balanceScore += 0.25;

    // Helpful ratio (0-1.0)
    const totalVotes = review.helpfulCount + review.notHelpfulCount;
    const helpfulRatio = totalVotes > 0 ? review.helpfulCount / totalVotes : 0;

    // Total score = weighted average
    const totalScore =
      lengthScore * 0.3 +
      detailScore * 0.25 +
      balanceScore * 0.25 +
      helpfulRatio * 0.2;

    // Upsert quality score
    const qualityScore = await this.prisma.reviewQualityScore.upsert({
      where: { reviewId },
      create: {
        reviewId,
        lengthScore: new Decimal(lengthScore.toFixed(2)),
        detailScore: new Decimal(detailScore.toFixed(2)),
        balanceScore: new Decimal(balanceScore.toFixed(2)),
        helpfulRatio: new Decimal(helpfulRatio.toFixed(2)),
        totalScore: new Decimal(totalScore.toFixed(2)),
      },
      update: {
        lengthScore: new Decimal(lengthScore.toFixed(2)),
        detailScore: new Decimal(detailScore.toFixed(2)),
        balanceScore: new Decimal(balanceScore.toFixed(2)),
        helpfulRatio: new Decimal(helpfulRatio.toFixed(2)),
        totalScore: new Decimal(totalScore.toFixed(2)),
        recalculatedAt: new Date(),
      },
    });

    return qualityScore;
  }

  async getScore(reviewId: string) {
    return this.prisma.reviewQualityScore.findUnique({ where: { reviewId } });
  }

  async batchRecalculate(entityId: string, limit: number = 100) {
    const reviews = await this.prisma.review.findMany({
      where: { entityId, deletedAt: null, status: 'published' },
      select: { id: true },
      take: limit,
    });

    const results = [];
    for (const review of reviews) {
      const qs = await this.calculateScore(review.id);
      results.push({ reviewId: review.id, totalScore: qs.totalScore });
    }

    return { recalculated: results.length, results };
  }
}
