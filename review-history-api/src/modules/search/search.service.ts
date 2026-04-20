import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { SearchEntitiesDto } from './dto/search-entities.dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchEntities(query: SearchEntitiesDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EntityWhereInput = {
      deletedAt: null,
      status: { notIn: ['merged', 'archived', 'suspended'] },
    };

    if (query.q) {
      where.OR = [
        { displayName: { contains: query.q, mode: 'insensitive' } },
        { normalizedName: { contains: query.q.toLowerCase().replace(/[^a-z0-9]/g, '') } },
        { aliases: { some: { aliasText: { contains: query.q, mode: 'insensitive' } } } },
      ];
    }

    if (query.categoryKey) {
      where.category = { key: query.categoryKey };
    }

    if (query.minRating) {
      where.averageRating = { gte: query.minRating };
    }

    if (query.cityId) {
      where.cityId = query.cityId;
    }
    if (!query.cityId && query.city) {
      where.city = { nameEn: { contains: query.city.trim(), mode: 'insensitive' } };
    }

    if (query.localityId) {
      where.localityId = query.localityId;
    }

    let orderBy: Prisma.EntityOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'rating' || query.sort === 'rating_desc') orderBy = { averageRating: 'desc' };
    if (query.sort === 'rating_asc') orderBy = { averageRating: 'asc' };
    if (query.sort === 'reviews' || query.sort === 'reviews_desc') orderBy = { reviewCount: 'desc' };
    if (query.sort === 'trust_desc') orderBy = { trustScore: 'desc' };
    if (query.sort === 'name') orderBy = { displayName: 'asc' };

    const [entities, total] = await Promise.all([
      this.prisma.entity.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: { select: { key: true, nameEn: true } },
          city: { select: { nameEn: true } },
          locality: { select: { nameEn: true } },
        },
      }),
      this.prisma.entity.count({ where }),
    ]);

    const items = entities.map((e) => ({
      id: e.id,
      name: e.displayName,
      address: e.addressLine,
      averageRating: Number(e.averageRating),
      reviewCount: e.reviewCount,
      trustScore: e.trustScore,
      status: e.status,
      isClaimed: e.isClaimed,
      categoryKey: e.category.key,
      categoryName: e.category.nameEn,
      city: e.city.nameEn,
      locality: e.locality?.nameEn || null,
      createdAt: e.createdAt,
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }
}
