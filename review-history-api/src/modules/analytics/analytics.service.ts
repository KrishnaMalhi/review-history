import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AnalyticsEventType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(data: {
    eventType: AnalyticsEventType;
    entityId?: string;
    userId?: string;
    metadataJson?: any;
  }) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        entityId: data.entityId || null,
        userId: data.userId || null,
        metadataJson: data.metadataJson || null,
      },
    });
  }

  async getEntityPageViews(entityId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const views = await this.prisma.analyticsEvent.count({
      where: {
        entityId,
        eventType: 'entity_page_view',
        createdAt: { gte: since },
      },
    });

    return { entityId, views, period: `${days}d` };
  }

  async getEntityDashboard(entityId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [pageViews, profileViews, searchImpressions] =
      await Promise.all([
        this.prisma.analyticsEvent.count({
          where: { entityId, eventType: 'entity_page_view', createdAt: { gte: since } },
        }),
        this.prisma.analyticsEvent.count({
          where: { entityId, eventType: 'profile_view', createdAt: { gte: since } },
        }),
        this.prisma.analyticsEvent.count({
          where: { entityId, eventType: 'search_impression', createdAt: { gte: since } },
        }),
      ]);

    // Daily breakdown (last 7 days)
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await this.prisma.analyticsEvent.count({
        where: {
          entityId,
          eventType: 'entity_page_view',
          createdAt: { gte: dayStart, lt: dayEnd },
        },
      });
      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        views: count,
      });
    }

    return {
      entityId,
      period: `${days}d`,
      pageViews,
      profileViews,
      searchImpressions,
      dailyBreakdown,
    };
  }

  async trackPageView(entityId: string, userId?: string) {
    return this.trackEvent({
      eventType: 'entity_page_view',
      entityId,
      userId,
    });
  }
}
