import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

export type StreakActivityType =
  | 'feed_visit'
  | 'discussion_visit'
  | 'community_visit'
  | 'active_time'
  | 'add_listing'
  | 'add_review'
  | 'like_or_vote'
  | 'share'
  | 'follow'
  | 'discussion_post'
  | 'discussion_comment'
  | 'community_validation';

@Injectable()
export class ReviewStreaksService {
  constructor(private readonly prisma: PrismaService) {}

  private getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getDayDiff(a: Date, b: Date) {
    const d1 = new Date(a);
    const d2 = new Date(b);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  private activityPoints(type: StreakActivityType, minutes: number) {
    switch (type) {
      case 'add_review':
        return 8;
      case 'add_listing':
        return 6;
      case 'discussion_post':
        return 5;
      case 'discussion_comment':
        return 3;
      case 'follow':
        return 2;
      case 'share':
        return 2;
      case 'community_validation':
      case 'like_or_vote':
        return 1;
      case 'active_time':
        return Math.min(5, Math.max(1, Math.floor(minutes / 5)));
      case 'feed_visit':
      case 'discussion_visit':
      case 'community_visit':
      default:
        return 1;
    }
  }

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
    return this.recordActivity(userId, 'add_review');
  }

  async recordActivity(userId: string, activityType: StreakActivityType, minutes = 0) {
    const streak = await this.getUserStreak(userId);
    const streakAny = streak as any;
    const now = new Date();
    const lastActive = streakAny.lastActiveDate || streak.lastReviewDate;

    let newCurrentStreak = streak.currentStreak;
    let activeDaysCount = streakAny.activeDaysCount ?? 0;
    let weeklyCount = streak.weeklyCount;
    let weekStartDate = streak.weekStartDate;

    const currentWeekStart = this.getWeekStart(now);
    if (!weekStartDate || this.getWeekStart(weekStartDate).getTime() !== currentWeekStart.getTime()) {
      weeklyCount = 0;
      weekStartDate = currentWeekStart;
    }

    if (lastActive) {
      const diffDays = this.getDayDiff(lastActive, now);

      if (diffDays === 0) {
        // Same day, no streak change
      } else if (diffDays === 1) {
        // Consecutive day — extend streak
        newCurrentStreak += 1;
        activeDaysCount += 1;
      } else {
        // Streak broken — reset
        newCurrentStreak = 1;
        activeDaysCount += 1;
      }
    } else {
      // First activity
      newCurrentStreak = 1;
      activeDaysCount = 1;
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
    const points = this.activityPoints(activityType, minutes);

    const updateData: any = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: now,
      totalPoints: { increment: points },
      weeklyCount: weeklyCount + 1,
      weekStartDate,
      activeDaysCount,
    };

    if (activityType === 'add_review') {
      updateData.lastReviewDate = now;
      updateData.reviewsAddedCount = { increment: 1 };
    }
    if (activityType === 'add_listing') updateData.listingsAddedCount = { increment: 1 };
    if (activityType === 'discussion_post') updateData.discussionPostsCount = { increment: 1 };
    if (activityType === 'discussion_comment') updateData.discussionCommentsCount = { increment: 1 };
    if (activityType === 'like_or_vote') updateData.likesCount = { increment: 1 };
    if (activityType === 'share') updateData.sharesCount = { increment: 1 };
    if (activityType === 'follow') updateData.followsCount = { increment: 1 };
    if (activityType === 'community_validation') updateData.validationsCount = { increment: 1 };
    if (activityType === 'feed_visit') updateData.feedVisitCount = { increment: 1 };
    if (activityType === 'discussion_visit') updateData.discussionVisitCount = { increment: 1 };
    if (activityType === 'community_visit') updateData.communityVisitCount = { increment: 1 };
    if (activityType === 'active_time') updateData.activeMinutes = { increment: Math.max(1, minutes) };

    return this.prisma.reviewStreak.update({
      where: { userId },
      data: updateData,
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
