import { Injectable, NotFoundException, ConflictException, Optional } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { VoteType } from '@prisma/client';
import { ReviewStreaksService } from '../review-streaks/review-streaks.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewStreaks: ReviewStreaksService,
    @Optional() private readonly realtime?: RealtimeGateway,
  ) {}

  async vote(reviewId: string, userId: string, voteType: VoteType) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null, status: 'published' },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Check for existing vote of same type
    const existing = await this.prisma.reviewVote.findFirst({
      where: { reviewId, voterUserId: userId, voteType },
    });

    if (existing) {
      // Remove vote (toggle off)
      await this.prisma.reviewVote.delete({ where: { id: existing.id } });
      const counts = await this.updateVoteCounts(reviewId);
      this.realtime?.emitReviewVote(reviewId, counts.helpful, counts.notHelpful, counts.seemsFake);
      return { action: 'removed', voteType };
    }

    // Remove any opposite vote first
    await this.prisma.reviewVote.deleteMany({
      where: { reviewId, voterUserId: userId },
    });

    // Create vote
    await this.prisma.reviewVote.create({
      data: {
        reviewId,
        voterUserId: userId,
        voteType,
      },
    });

    await this.reviewStreaks.recordActivity(userId, 'like_or_vote');

    const counts = await this.updateVoteCounts(reviewId);
    this.realtime?.emitReviewVote(reviewId, counts.helpful, counts.notHelpful, counts.seemsFake);
    return { action: 'added', voteType };
  }

  async getVoteSummary(reviewId: string, userId?: string) {
    const [helpful, notHelpful, seemsFake] = await Promise.all([
      this.prisma.reviewVote.count({ where: { reviewId, voteType: 'helpful' } }),
      this.prisma.reviewVote.count({ where: { reviewId, voteType: 'not_helpful' } }),
      this.prisma.reviewVote.count({ where: { reviewId, voteType: 'seems_fake' } }),
    ]);

    let userVote: VoteType | null = null;
    if (userId) {
      const vote = await this.prisma.reviewVote.findFirst({
        where: { reviewId, voterUserId: userId },
      });
      userVote = vote?.voteType || null;
    }

    return { helpful, notHelpful, seemsFake, userVote };
  }

  private async updateVoteCounts(reviewId: string) {
    const [helpful, notHelpful, seemsFake] = await Promise.all([
      this.prisma.reviewVote.count({ where: { reviewId, voteType: 'helpful' } }),
      this.prisma.reviewVote.count({ where: { reviewId, voteType: 'not_helpful' } }),
      this.prisma.reviewVote.count({ where: { reviewId, voteType: 'seems_fake' } }),
    ]);

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: helpful, notHelpfulCount: notHelpful, fakeVoteCount: seemsFake },
    });

    return { helpful, notHelpful, seemsFake };
  }
}
