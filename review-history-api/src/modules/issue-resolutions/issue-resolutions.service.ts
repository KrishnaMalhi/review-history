import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class IssueResolutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async markResolved(reviewId: string, userId: string) {
    // Get review
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, status: 'published', deletedAt: null },
      include: { entity: { select: { id: true } } },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Verify user is claimed owner
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId: review.entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) throw new ForbiddenException('Only the entity owner can mark issues as resolved');

    // Must have at least one reply first
    const reply = await this.prisma.reviewReply.findFirst({
      where: { reviewId, authorUserId: userId, status: 'published' },
      orderBy: { createdAt: 'desc' },
    });
    if (!reply) throw new ForbiddenException('You must reply to the review before marking it resolved');

    // Check if resolution already exists
    const existing = await this.prisma.issueResolution.findUnique({
      where: { reviewId },
    });
    if (existing) throw new ConflictException('Issue resolution already exists for this review');

    const resolution = await this.prisma.issueResolution.create({
      data: {
        reviewId,
        replyId: reply.id,
        status: 'resolved_by_owner',
        resolvedAt: new Date(),
      },
    });

    // Notify review author
    await this.notifications.createNotification(
      review.authorUserId,
      'moderation_action',
      {
        message: 'The entity owner has marked your review issue as resolved',
        reviewId,
        entityId: review.entityId,
        action: 'issue_resolved',
      },
    );

    return { status: resolution.status, resolvedAt: resolution.resolvedAt };
  }

  async confirmResolved(reviewId: string, userId: string) {
    const resolution = await this.prisma.issueResolution.findUnique({
      where: { reviewId },
      include: { review: { select: { authorUserId: true, entityId: true } } },
    });
    if (!resolution) throw new NotFoundException('No resolution found for this review');

    // Only original author can confirm
    if (resolution.review.authorUserId !== userId) {
      throw new ForbiddenException('Only the review author can confirm resolution');
    }

    if (resolution.status !== 'resolved_by_owner') {
      throw new ConflictException('Resolution can only be confirmed when status is resolved_by_owner');
    }

    await this.prisma.issueResolution.update({
      where: { reviewId },
      data: { status: 'confirmed_resolved', confirmedAt: new Date() },
    });

    return { status: 'confirmed_resolved' };
  }

  async disputeResolution(reviewId: string, userId: string) {
    const resolution = await this.prisma.issueResolution.findUnique({
      where: { reviewId },
      include: { review: { select: { authorUserId: true, entityId: true } } },
    });
    if (!resolution) throw new NotFoundException('No resolution found for this review');

    if (resolution.review.authorUserId !== userId) {
      throw new ForbiddenException('Only the review author can dispute resolution');
    }

    if (resolution.status !== 'resolved_by_owner') {
      throw new ConflictException('Resolution can only be disputed when status is resolved_by_owner');
    }

    await this.prisma.issueResolution.update({
      where: { reviewId },
      data: { status: 'disputed' },
    });

    return { status: 'disputed' };
  }

  async getByReview(reviewId: string) {
    return this.prisma.issueResolution.findUnique({
      where: { reviewId },
      select: {
        status: true,
        resolvedAt: true,
        confirmedAt: true,
        createdAt: true,
      },
    });
  }
}
