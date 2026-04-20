import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { CategoryExtensionsService } from '../category-extensions/category-extensions.service';
import { ReviewStreaksService } from '../review-streaks/review-streaks.service';
import { ReviewQualityService } from '../review-quality/review-quality.service';
import { BadgesService } from '../badges/badges.service';
import { ResponseMetricsService } from '../response-metrics/response-metrics.service';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly categoryExtensions: CategoryExtensionsService,
    private readonly reviewStreaks: ReviewStreaksService,
    private readonly reviewQuality: ReviewQualityService,
    private readonly badges: BadgesService,
    private readonly responseMetrics: ResponseMetricsService,
  ) {}

  async create(entityId: string, dto: CreateReviewDto, userId: string) {
    // Step 1: Validate entity exists
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, deletedAt: null, status: { notIn: ['merged', 'archived', 'suspended'] } },
      include: { category: { select: { key: true } } },
    });
    if (!entity) throw new NotFoundException('Entity not found');

    // Step 2: Check one-review-per-entity eligibility
    const existingReview = await this.prisma.review.findFirst({
      where: { entityId, authorUserId: userId, deletedAt: null },
    });
    if (existingReview) {
      throw new ConflictException({
        code: 'REVIEW_ALREADY_EXISTS',
        message: 'You have already reviewed this entity.',
      });
    }

    // Step 3: Rate limit — max 5 reviews per user per day
    const rateLimitKey = `review_rate:${userId}`;
    const currentCount = await this.redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await this.redis.expire(rateLimitKey, 86400);
    }
    if (currentCount > 5) {
      throw new BadRequestException({
        code: 'REVIEW_RATE_LIMIT',
        message: 'You can submit a maximum of 5 reviews per day.',
      });
    }

    // Step 4: Sanitize inputs
    const sanitizedTitle = dto.title ? sanitizeInput(dto.title) : null;
    const sanitizedBody = sanitizeInput(dto.body);

    // Step 5: Basic content rules check
    const riskState = await this.assessRisk(sanitizedBody, userId);

    // Step 6: Resolve tag IDs
    let tagLinks: { tagId: string; intensity?: number }[] = [];
    if (dto.tagKeys?.length) {
      const tags = await this.prisma.warningTag.findMany({
        where: { key: { in: dto.tagKeys }, isActive: true },
      });
      tagLinks = tags.map((t) => ({ tagId: t.id }));
    }

    // Step 7: Create review
    const review = await this.prisma.review.create({
      data: {
        entityId,
        authorUserId: userId,
        overallRating: dto.overallRating,
        title: sanitizedTitle,
        body: sanitizedBody,
        experienceMonth: dto.experienceMonth,
        experienceYear: dto.experienceYear,
        languageCode: dto.languageCode || 'en',
        status: riskState === 'clean' ? 'published' : 'under_verification',
        moderationState: riskState === 'clean' ? 'clean' : 'under_verification',
        riskState,
        underVerification: riskState !== 'clean',
        publishedAt: riskState === 'clean' ? new Date() : null,
        tagLinks: {
          create: tagLinks.map((tl) => ({ tagId: tl.tagId, intensity: tl.intensity })),
        },
      },
      include: {
        tagLinks: { include: { tag: { select: { key: true, labelEn: true, isPositive: true } } } },
      },
    });

    // Step 8: Store category-specific extension data
    if (dto.categoryData && Object.keys(dto.categoryData).length > 0) {
      const categoryKey = entity.category?.key;
      if (categoryKey) {
        try {
          await this.categoryExtensions.createReviewData(
            review.id,
            categoryKey,
            dto.categoryData,
          );
        } catch (err: any) {
          this.logger.warn(
            `Failed to store category data for review ${review.id}: ${err.message}`,
          );
        }
      }
    }

    // Step 9: Update entity aggregates
    await this.updateEntityAggregates(entityId);

    // Step 10: Post-creation hooks (non-blocking)
    this.postReviewCreationHooks(review.id, userId, entityId).catch((err) =>
      this.logger.warn(`Post-review hooks failed: ${err.message}`),
    );

    // Step 11: Create audit log
    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: 'user',
        action: 'review.created',
        objectType: 'review',
        objectId: review.id,
        metadataJson: { entityId, rating: dto.overallRating },
      },
    });

    // Step 12: Create moderation case if flagged
    if (riskState !== 'clean') {
      await this.prisma.moderationCase.create({
        data: {
          objectType: 'review',
          objectId: review.id,
          triggerType: 'auto_risk_detection',
          severity: 'medium',
        },
      });
    }

    return {
      reviewId: review.id,
      status: review.status,
      underVerification: review.underVerification,
    };
  }

  async findByEntity(entityId: string, query: ListReviewsDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ReviewWhereInput = {
      entityId,
      deletedAt: null,
      status: { in: ['published', 'under_verification'] },
    };

    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'highest') orderBy = { overallRating: 'desc' };
    if (query.sort === 'lowest') orderBy = { overallRating: 'asc' };
    if (query.sort === 'helpful') orderBy = { helpfulCount: 'desc' };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          author: { select: { id: true, displayName: true, trustLevel: true } },
          tagLinks: {
            include: { tag: { select: { key: true, labelEn: true, labelUr: true, isPositive: true, severityWeight: true } } },
          },
          replies: {
            where: { status: 'published' },
            include: { author: { select: { id: true, displayName: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const items = reviews.map((r) => ({
      id: r.id,
      overallRating: r.overallRating,
      title: r.title,
      body: r.body,
      experienceMonth: r.experienceMonth,
      experienceYear: r.experienceYear,
      languageCode: r.languageCode,
      status: r.status,
      underVerification: r.underVerification,
      helpfulCount: r.helpfulCount,
      notHelpfulCount: r.notHelpfulCount,
      fakeVoteCount: r.fakeVoteCount,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
      author: {
        id: r.author.id,
        displayName: 'Anonymous',
        trustLevel: r.author.trustLevel,
      },
      tags: r.tagLinks.map((tl) => ({
        key: tl.tag.key,
        labelEn: tl.tag.labelEn,
        labelUr: tl.tag.labelUr,
        isPositive: tl.tag.isPositive,
        severityWeight: tl.tag.severityWeight,
      })),
      replies: r.replies.map((reply) => ({
        id: reply.id,
        body: reply.body,
        authorRole: reply.authorRole,
        author: { id: reply.author.id, displayName: reply.author.displayName },
        createdAt: reply.createdAt,
      })),
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }

  async update(reviewId: string, dto: UpdateReviewDto, userId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.authorUserId !== userId) throw new ForbiddenException('You can only edit your own reviews');

    // Allow edits within 48 hours of creation
    const hoursElapsed = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 48) {
      throw new BadRequestException('Review can only be edited within 48 hours of submission');
    }

    const updateData: Prisma.ReviewUpdateInput = {};
    if (dto.title !== undefined) updateData.title = sanitizeInput(dto.title);
    if (dto.body !== undefined) updateData.body = sanitizeInput(dto.body);
    if (dto.overallRating !== undefined) updateData.overallRating = dto.overallRating;

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    await this.updateEntityAggregates(review.entityId);

    return { reviewId: updated.id, status: updated.status };
  }

  async softDelete(reviewId: string, userId: string, userRole: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Review not found');

    const isAdmin = ['admin', 'super_admin', 'moderator'].includes(userRole);
    if (review.authorUserId !== userId && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this review');
    }

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { deletedAt: new Date(), status: 'removed' },
    });

    await this.updateEntityAggregates(review.entityId);

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: isAdmin ? 'admin' : 'user',
        action: 'review.deleted',
        objectType: 'review',
        objectId: reviewId,
      },
    });

    return { message: 'Review deleted' };
  }

  async getUserReviews(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ReviewWhereInput = { authorUserId: userId, deletedAt: null };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          entity: {
            select: { id: true, displayName: true, category: { select: { nameEn: true } }, city: { select: { nameEn: true } } },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const items = reviews.map((r) => ({
      id: r.id,
      overallRating: r.overallRating,
      title: r.title,
      body: r.body,
      status: r.status,
      createdAt: r.createdAt,
      entity: {
        id: r.entity.id,
        displayName: r.entity.displayName,
        category: r.entity.category.nameEn,
        city: r.entity.city.nameEn,
      },
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }

  async adminListReviews(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    q?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ReviewWhereInput = { deletedAt: null };

    if (status) {
      where.status = status as any;
    }

    if (q?.trim()) {
      where.OR = [
        { title: { contains: q.trim(), mode: 'insensitive' } },
        { body: { contains: q.trim(), mode: 'insensitive' } },
        { entity: { displayName: { contains: q.trim(), mode: 'insensitive' } } },
        { author: { displayName: { contains: q.trim(), mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, displayName: true, email: true, phoneE164: true } },
          entity: { select: { id: true, displayName: true, category: { select: { key: true, nameEn: true } } } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      overallRating: r.overallRating,
      title: r.title,
      body: r.body,
      status: r.status,
      moderationState: r.moderationState,
      riskState: r.riskState,
      helpfulCount: r.helpfulCount,
      notHelpfulCount: r.notHelpfulCount,
      fakeVoteCount: r.fakeVoteCount,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt,
      author: r.author,
      entity: r.entity,
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }

  async adminGetReview(reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
      include: {
        author: { select: { id: true, displayName: true, email: true, phoneE164: true, role: true, status: true } },
        entity: {
          select: {
            id: true,
            displayName: true,
            category: { select: { key: true, nameEn: true } },
            city: { select: { nameEn: true } },
          },
        },
        tagLinks: { include: { tag: { select: { id: true, key: true, labelEn: true, isPositive: true } } } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, displayName: true } } },
        },
        reports: { orderBy: { createdAt: 'desc' } },
        votes: true,
      },
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async adminUpdateReviewStatus(
    reviewId: string,
    status: 'published' | 'hidden' | 'removed' | 'under_verification',
    adminUserId: string,
  ) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
      select: { id: true, entityId: true, status: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        moderationState:
          status === 'published'
            ? 'clean'
            : status === 'hidden'
              ? 'hidden_pending_review'
              : status === 'under_verification'
                ? 'under_verification'
                : 'removed_by_policy',
        underVerification: status === 'under_verification',
        deletedAt: status === 'removed' ? new Date() : null,
        publishedAt: status === 'published' ? new Date() : null,
      },
    });

    await this.updateEntityAggregates(review.entityId);

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        actorType: 'admin',
        action: `review.admin_status.${status}`,
        objectType: 'review',
        objectId: reviewId,
      },
    });

    return { reviewId: updated.id, status: updated.status };
  }

  async getFeed(
    page: number = 1,
    pageSize: number = 20,
    category?: string,
    sort: 'recent' | 'helpful' | 'trending' = 'recent',
    rating?: number,
  ) {
    const skip = (page - 1) * pageSize;
    const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
      sort === 'helpful'
        ? [{ helpfulCount: 'desc' }, { publishedAt: 'desc' }]
        : sort === 'trending'
          ? [{ helpfulCount: 'desc' }, { publishedAt: 'desc' }]
          : [{ publishedAt: 'desc' }];

    const where: Prisma.ReviewWhereInput = {
      deletedAt: null,
      status: 'published',
      ...(rating ? { overallRating: { gte: rating } } : {}),
      entity: {
        deletedAt: null,
        status: { notIn: ['merged', 'archived', 'suspended'] },
        ...(category ? { category: { key: category } } : {}),
      },
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          author: { select: { id: true, displayName: true, trustLevel: true } },
          entity: {
            select: {
              id: true,
              displayName: true,
              averageRating: true,
              reviewCount: true,
              trustScore: true,
              addressLine: true,
              category: { select: { key: true, nameEn: true, icon: true } },
              city: { select: { nameEn: true } },
            },
          },
          tagLinks: {
            include: { tag: { select: { key: true, labelEn: true, isPositive: true } } },
          },
          replies: {
            where: { status: 'published' },
            include: { author: { select: { id: true, displayName: true } } },
            orderBy: { createdAt: 'asc' },
            take: 3,
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const items = reviews.map((r) => ({
      id: r.id,
      overallRating: r.overallRating,
      title: r.title,
      body: r.body,
      status: r.status,
      helpfulCount: r.helpfulCount,
      notHelpfulCount: r.notHelpfulCount,
      unhelpfulCount: r.notHelpfulCount,
      fakeVoteCount: r.fakeVoteCount,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
      author: {
        id: r.author.id,
        displayName: 'Anonymous',
        trustLevel: r.author.trustLevel,
      },
      entity: {
        id: r.entity.id,
        name: r.entity.displayName,
        averageRating: Number(r.entity.averageRating),
        reviewCount: r.entity.reviewCount,
        trustScore: r.entity.trustScore,
        address: r.entity.addressLine,
        categoryKey: r.entity.category.key,
        categoryName: r.entity.category.nameEn,
        categoryIcon: r.entity.category.icon,
        city: r.entity.city.nameEn,
      },
      tags: r.tagLinks.map((tl) => ({
        key: tl.tag.key,
        label: tl.tag.labelEn,
        isPositive: tl.tag.isPositive,
      })),
      replies: r.replies.map((reply) => ({
        id: reply.id,
        body: reply.body,
        authorRole: reply.authorRole,
        authorName: reply.author.displayName,
        createdAt: reply.createdAt,
      })),
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }

  private async assessRisk(body: string, userId: string): Promise<'clean' | 'low_confidence' | 'under_verification'> {
    // Check account age
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return 'under_verification';

    const accountAgeHours = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60);
    if (accountAgeHours < 1) return 'under_verification';
    if (accountAgeHours < 24) return 'low_confidence';

    // Check body length quality
    if (body.length < 20) return 'low_confidence';

    return 'clean';
  }

  private async updateEntityAggregates(entityId: string) {
    const aggregates = await this.prisma.review.aggregate({
      where: { entityId, deletedAt: null, status: 'published' },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    const suspiciousCount = await this.prisma.review.count({
      where: { entityId, deletedAt: null, riskState: { not: 'clean' } },
    });

    const hiddenCount = await this.prisma.review.count({
      where: { entityId, deletedAt: null, status: 'hidden' },
    });

    await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        averageRating: aggregates._avg.overallRating || 0,
        ratingCount: aggregates._count.id,
        reviewCount: aggregates._count.id,
        suspiciousReviewCount: suspiciousCount,
        hiddenReviewCount: hiddenCount,
        lastReviewedAt: new Date(),
      },
    });
  }

  private async postReviewCreationHooks(
    reviewId: string,
    userId: string,
    entityId: string,
  ) {
    // Track review streak
    await this.reviewStreaks.recordReviewActivity(userId);

    // Calculate review quality score (async, best-effort)
    await this.reviewQuality.calculateScore(reviewId);

    // Re-evaluate user badges
    await this.badges.evaluateUserBadges(userId);

    // Recalculate entity response metrics
    await this.responseMetrics.recalculate(entityId);
  }
}
