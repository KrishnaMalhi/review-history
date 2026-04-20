import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CommunityValidationType } from '@prisma/client';

@Injectable()
export class CommunityValidationsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    reviewId: string,
    userId: string,
    validationType: CommunityValidationType,
  ) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null, status: 'published' },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.authorUserId === userId) {
      throw new BadRequestException('Cannot validate your own review');
    }

    const existing = await this.prisma.communityValidation.findFirst({
      where: { reviewId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already validated this review');
    }

    const validation = await this.prisma.communityValidation.create({
      data: {
        reviewId,
        userId,
        validationType,
      },
    });

    // Update review helpful counts based on type
    if (validationType === 'confirmed') {
      await this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
    }

    return validation;
  }

  async removeValidation(reviewId: string, userId: string) {
    const existing = await this.prisma.communityValidation.findFirst({
      where: { reviewId, userId },
    });
    if (!existing) throw new NotFoundException('Validation not found');

    await this.prisma.communityValidation.delete({ where: { id: existing.id } });

    if (existing.validationType === 'confirmed') {
      await this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      });
    }

    return { message: 'Validation removed' };
  }

  async getByReview(reviewId: string) {
    const validations = await this.prisma.communityValidation.findMany({
      where: { reviewId },
      include: {
        user: { select: { id: true, displayName: true, trustLevel: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      confirmed: validations.filter((v) => v.validationType === 'confirmed').length,
      outdated: validations.filter((v) => v.validationType === 'outdated').length,
      resolved: validations.filter((v) => v.validationType === 'resolved').length,
      total: validations.length,
    };

    return { summary, validations };
  }
}
