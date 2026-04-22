import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { ReplyAuthorRole } from '@prisma/client';

@Injectable()
export class RepliesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewId: string, dto: CreateReplyDto, userId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null, status: 'published' },
      include: { entity: { select: { id: true } } },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Only approved claim owner of this exact entity can reply.
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId: review.entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) {
      throw new ForbiddenException('Only approved claim owner can reply to this review');
    }

    const body = sanitizeInput(dto.body).trim();
    if (body.length < 2 || body.length > 2000) {
      throw new BadRequestException('Reply must be between 2 and 2000 characters');
    }

    const authorRole: ReplyAuthorRole = 'claimed_owner';

    const reply = await this.prisma.reviewReply.create({
      data: {
        reviewId,
        authorUserId: userId,
        authorRole,
        body,
      },
    });

    return {
      replyId: reply.id,
      authorRole,
      createdAt: reply.createdAt,
    };
  }

  async softDelete(replyId: string, userId: string, userRole: string) {
    const reply = await this.prisma.reviewReply.findFirst({
      where: { id: replyId, status: 'published' },
    });
    if (!reply) throw new NotFoundException('Reply not found');

    const isAdmin = ['admin', 'super_admin', 'moderator'].includes(userRole);
    if (reply.authorUserId !== userId && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this reply');
    }

    await this.prisma.reviewReply.update({
      where: { id: replyId },
      data: { status: 'removed' },
    });

    return { message: 'Reply deleted' };
  }
}
