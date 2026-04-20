import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../../infra/redis/redis.service';
import { sanitizeInput } from '../../common/utils/helpers';

const UUID_V4_OR_V1_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        phoneE164: true,
        displayName: true,
        usernameSlug: true,
        trustLevel: true,
        status: true,
        role: true,
        cityId: true,
        city: { select: { id: true, nameEn: true, nameUr: true } },
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.isEmailVerified,
      phone: user.phoneE164,
      displayName: user.displayName,
      bio: null,
      city: user.city?.nameEn ?? null,
      trustLevel: user.trustLevel,
      status: user.status,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let resolvedCityId = dto.cityId;
    const cityInput = dto.city ? sanitizeInput(dto.city) : undefined;

    if (!resolvedCityId && cityInput) {
      const cityOrFilters: Array<Record<string, unknown>> = [
        { nameEn: { equals: cityInput, mode: 'insensitive' } },
        { nameUr: { equals: cityInput, mode: 'insensitive' } },
      ];

      if (UUID_V4_OR_V1_REGEX.test(cityInput)) {
        cityOrFilters.unshift({ id: cityInput });
      }

      const city = await this.prisma.city.findFirst({
        where: {
          OR: cityOrFilters,
          isActive: true,
        },
        select: { id: true },
      });
      resolvedCityId = city?.id;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName ? sanitizeInput(dto.displayName) : undefined,
        usernameSlug: dto.usernameSlug ? dto.usernameSlug.trim().toLowerCase() : undefined,
        cityId: resolvedCityId,
      },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        phoneE164: true,
        displayName: true,
        usernameSlug: true,
        city: { select: { nameEn: true } },
        trustLevel: true,
        status: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      emailVerified: updated.isEmailVerified,
      phone: updated.phoneE164,
      displayName: updated.displayName,
      bio: dto.bio ? sanitizeInput(dto.bio) : null,
      city: updated.city?.nameEn ?? cityInput ?? null,
      trustLevel: updated.trustLevel,
      status: updated.status,
      role: updated.role,
      lastLoginAt: updated.lastLoginAt,
      createdAt: updated.createdAt,
    };
  }

  async getSavedEntities(userId: string) {
    const key = this.getSavedEntitiesKey(userId);
    const ids = await this.redis.client.zrevrange(key, 0, -1);
    if (!ids.length) {
      return [];
    }

    const entities = await this.prisma.entity.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        status: { notIn: ['merged', 'archived', 'suspended'] },
      },
      include: {
        category: { select: { key: true, nameEn: true } },
        city: { select: { nameEn: true } },
        locality: { select: { nameEn: true } },
      },
    });

    const byId = new Map(entities.map((entity) => [entity.id, entity]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

    return ordered.map((entity: any) => ({
      id: entity.id,
      name: entity.displayName,
      address: entity.addressLine,
      averageRating: Number(entity.averageRating),
      reviewCount: entity.reviewCount,
      trustScore: entity.trustScore,
      status: entity.status,
      isClaimed: entity.isClaimed,
      categoryKey: entity.category.key,
      categoryName: entity.category.nameEn,
      city: entity.city.nameEn,
      locality: entity.locality?.nameEn || null,
      createdAt: entity.createdAt,
    }));
  }

  async saveEntity(userId: string, entityId: string) {
    const exists = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
        deletedAt: null,
        status: { notIn: ['merged', 'archived', 'suspended'] },
      },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Entity not found');
    }

    const key = this.getSavedEntitiesKey(userId);
    await this.redis.client.zadd(key, Date.now(), entityId);
    return { saved: true, entityId };
  }

  async unsaveEntity(userId: string, entityId: string) {
    const key = this.getSavedEntitiesKey(userId);
    await this.redis.client.zrem(key, entityId);
    return { saved: false, entityId };
  }

  private getSavedEntitiesKey(userId: string) {
    return `user:${userId}:saved_entities`;
  }
}
