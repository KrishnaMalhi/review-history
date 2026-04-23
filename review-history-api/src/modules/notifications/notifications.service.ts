import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

type NotificationTypeInput =
  | NotificationType
  | 'issue_resolved_by_owner'
  | 'issue_confirmed'
  | 'issue_disputed'
  | 'badge_awarded'
  | 'streak_milestone'
  | 'helpful_milestone'
  | 'weekly_recap'
  | 'new_review_on_followed'
  | 'campaign_ending_soon'
  | 'employer_verified';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    const mappedItems = items.map((item) => ({
      ...item,
      message:
        (item.payloadJson as Record<string, any> | null)?.message ||
        (item.payloadJson as Record<string, any> | null)?.title ||
        item.type,
    }));

    const paginated = new PaginatedResponse(mappedItems, total, page, pageSize) as PaginatedResponse<any> & {
      unreadCount: number;
    };
    paginated.unreadCount = unreadCount;
    return paginated;
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'All notifications marked as read' };
  }

  async createNotification(
    userId: string,
    type: NotificationTypeInput,
    payload: Record<string, any>,
    channel: NotificationChannel = 'in_app',
  ) {
    return this.prisma.notification.create({
      data: { userId, type: type as NotificationType, payloadJson: payload, channel },
    });
  }

  async send(input: {
    userId: string;
    type: NotificationTypeInput;
    payload: Record<string, any>;
    channel?: NotificationChannel;
  }) {
    return this.createNotification(
      input.userId,
      input.type,
      input.payload,
      input.channel ?? 'in_app',
    );
  }
}
