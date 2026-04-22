import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { ReviewStreaksService } from '../review-streaks/review-streaks.service';

@Injectable()
export class FollowsService {
  private static readonly MAX_FOLLOWS_PER_USER = 200;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewStreaks: ReviewStreaksService,
  ) {}

  async create(dto: CreateFollowDto, userId: string) {
    // Validate target exists
    if (dto.targetType === 'entity') {
      const entity = await this.prisma.entity.findFirst({
        where: { id: dto.targetId, deletedAt: null },
      });
      if (!entity) throw new NotFoundException('Entity not found');
    } else if (dto.targetType === 'category') {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.targetId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    // Check follow limit
    const count = await this.prisma.follow.count({ where: { userId } });
    if (count >= FollowsService.MAX_FOLLOWS_PER_USER) {
      throw new BadRequestException(`Maximum ${FollowsService.MAX_FOLLOWS_PER_USER} follows allowed`);
    }

    // Check duplicate
    const existing = await this.prisma.follow.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
    });
    if (existing) throw new ConflictException('Already following');

    const follow = await this.prisma.follow.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });

    await this.reviewStreaks.recordActivity(userId, 'follow');

    return { id: follow.id, targetType: follow.targetType, targetId: follow.targetId };
  }

  async remove(targetType: string, targetId: string, userId: string) {
    const follow = await this.prisma.follow.findFirst({
      where: { userId, targetType: targetType as any, targetId },
    });
    if (!follow) throw new NotFoundException('Follow not found');

    await this.prisma.follow.delete({ where: { id: follow.id } });
    return { message: 'Unfollowed' };
  }

  async getMyFollows(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with entity/category names
    const entityIds = follows.filter((f) => f.targetType === 'entity').map((f) => f.targetId);
    const categoryIds = follows.filter((f) => f.targetType === 'category').map((f) => f.targetId);

    const [entities, categories] = await Promise.all([
      entityIds.length > 0
        ? this.prisma.entity.findMany({
            where: { id: { in: entityIds } },
            select: { id: true, displayName: true, averageRating: true, reviewCount: true },
          })
        : [],
      categoryIds.length > 0
        ? this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, nameEn: true, key: true, icon: true },
          })
        : [],
    ]);

    const entityMap = new Map(entities.map((e) => [e.id, e]));
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return follows.map((f) => ({
      id: f.id,
      targetType: f.targetType,
      targetId: f.targetId,
      target:
        f.targetType === 'entity'
          ? entityMap.get(f.targetId) || null
          : categoryMap.get(f.targetId) || null,
      createdAt: f.createdAt,
    }));
  }

  async getFollowerCount(entityId: string) {
    const count = await this.prisma.follow.count({
      where: { targetType: 'entity', targetId: entityId },
    });
    return { entityId, followerCount: count };
  }

  async isFollowing(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findFirst({
      where: { userId, targetType: targetType as any, targetId },
    });
    return !!follow;
  }

  async getFollowedEntityIds(userId: string): Promise<string[]> {
    const follows = await this.prisma.follow.findMany({
      where: { userId, targetType: 'entity' },
      select: { targetId: true },
    });
    return follows.map((f) => f.targetId);
  }
}
