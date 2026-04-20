import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ReviewStreaksService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStreak(userId: string) {
    let streak = await this.prisma.reviewStreak.findUnique({ where: { userId } });

    if (!streak) {
      streak = await this.prisma.reviewStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return streak;
  }

  async recordReviewActivity(userId: string) {
    const streak = await this.getUserStreak(userId);
    const now = new Date();
    const lastActive = streak.lastReviewDate;

    let newCurrentStreak = streak.currentStreak;

    if (lastActive) {
      const diffMs = now.getTime() - lastActive.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no streak change
        return streak;
      } else if (diffDays === 1) {
        // Consecutive day — extend streak
        newCurrentStreak += 1;
      } else {
        // Streak broken — reset
        newCurrentStreak = 1;
      }
    } else {
      // First activity
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

    return this.prisma.reviewStreak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastReviewDate: now,
      },
    });
  }

  async getLeaderboard(limit: number = 20) {
    return this.prisma.reviewStreak.findMany({
      orderBy: { currentStreak: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, displayName: true, trustLevel: true } },
      },
    });
  }
}
