import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { SearchEntitiesDto } from './dto/search-entities.dto';
import { CursorPaginatedResponse } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchEntities(query: SearchEntitiesDto) {
    const limit = query.limit || query.pageSize || 20;
    const page = query.page || 1;
    const cursorId = query.cursor;

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

    const sort = query.sort || 'recommended';
    let entities: any[] = [];
    const total = await this.prisma.entity.count({ where });

    if (sort === 'recommended') {
      const pool = await this.prisma.entity.findMany({
        where,
        take: 500,
        include: {
          category: { select: { key: true, nameEn: true } },
          city: { select: { nameEn: true } },
          locality: { select: { nameEn: true } },
          responseMetric: { select: { responseRate: true } },
          employerProfile: { select: { isVerified: true } },
          schoolProfile: { select: { isVerified: true } },
          medicalProfile: { select: { isVerified: true } },
          productProfile: { select: { isVerified: true } },
        },
      });

      const qRaw = query.q?.trim().toLowerCase();
      const scored = pool.map((e) => {
        let textRelevance = 0.2;
        if (qRaw) {
          const name = e.displayName.toLowerCase();
          if (name === qRaw) textRelevance = 1;
          else if (name.startsWith(qRaw)) textRelevance = 0.8;
          else if (name.includes(qRaw)) textRelevance = 0.6;
          else textRelevance = 0.3;
        }

        const avgRatingNorm = Math.max(0, Math.min(1, Number(e.averageRating) / 5));
        const trustNorm = Math.max(0, Math.min(1, e.trustScore / 100));
        const responseRateNorm = Math.max(0, Math.min(1, Number(e.responseMetric?.responseRate || 0) / 100));
        const reviewVolumeNorm = Math.max(0, Math.min(1, Math.log(e.reviewCount + 1) / 5));
        const isVerified =
          e.employerProfile?.isVerified
          || e.schoolProfile?.isVerified
          || e.medicalProfile?.isVerified
          || e.productProfile?.isVerified;

        const searchScore =
          textRelevance * 0.3
          + avgRatingNorm * 0.2
          + trustNorm * 0.2
          + responseRateNorm * 0.15
          + reviewVolumeNorm * 0.1
          + (isVerified ? 0.05 : 0);

        return { row: e, searchScore };
      });

      scored.sort((a, b) => {
        if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;
        return b.row.createdAt.getTime() - a.row.createdAt.getTime();
      });

      const sortedRows = scored.map((x) => x.row);
      const startIndex = cursorId
        ? Math.max(0, sortedRows.findIndex((e) => e.id === cursorId) + 1)
        : Math.max(0, (page - 1) * limit);
      entities = sortedRows.slice(startIndex, startIndex + limit + 1);
    } else {
      let orderBy: Prisma.EntityOrderByWithRelationInput[] = [{ createdAt: 'desc' }, { id: 'desc' }];
      if (sort === 'rating' || sort === 'rating_desc') orderBy = [{ averageRating: 'desc' }, { id: 'desc' }];
      if (sort === 'rating_asc') orderBy = [{ averageRating: 'asc' }, { id: 'asc' }];
      if (sort === 'reviews' || sort === 'reviews_desc') orderBy = [{ reviewCount: 'desc' }, { id: 'desc' }];
      if (sort === 'trust_desc') orderBy = [{ trustScore: 'desc' }, { id: 'desc' }];
      if (sort === 'name') orderBy = [{ displayName: 'asc' }, { id: 'asc' }];

      const cursorEntity = cursorId
        ? await this.prisma.entity.findUnique({
            where: { id: cursorId },
            select: { id: true, createdAt: true, averageRating: true, reviewCount: true, trustScore: true, displayName: true },
          })
        : null;

      let cursorWhere: Prisma.EntityWhereInput | null = null;
      if (cursorEntity) {
        if (sort === 'rating' || sort === 'rating_desc') {
          cursorWhere = {
            OR: [
              { averageRating: { lt: cursorEntity.averageRating } },
              { averageRating: cursorEntity.averageRating, id: { lt: cursorEntity.id } },
            ],
          };
        } else if (sort === 'rating_asc') {
          cursorWhere = {
            OR: [
              { averageRating: { gt: cursorEntity.averageRating } },
              { averageRating: cursorEntity.averageRating, id: { gt: cursorEntity.id } },
            ],
          };
        } else if (sort === 'reviews' || sort === 'reviews_desc') {
          cursorWhere = {
            OR: [
              { reviewCount: { lt: cursorEntity.reviewCount } },
              { reviewCount: cursorEntity.reviewCount, id: { lt: cursorEntity.id } },
            ],
          };
        } else if (sort === 'trust_desc') {
          cursorWhere = {
            OR: [
              { trustScore: { lt: cursorEntity.trustScore } },
              { trustScore: cursorEntity.trustScore, id: { lt: cursorEntity.id } },
            ],
          };
        } else if (sort === 'name') {
          cursorWhere = {
            OR: [
              { displayName: { gt: cursorEntity.displayName } },
              { displayName: cursorEntity.displayName, id: { gt: cursorEntity.id } },
            ],
          };
        } else {
          cursorWhere = {
            OR: [
              { createdAt: { lt: cursorEntity.createdAt } },
              { createdAt: cursorEntity.createdAt, id: { lt: cursorEntity.id } },
            ],
          };
        }
      }

      const whereWithCursor = cursorWhere ? { AND: [where, cursorWhere] } : where;

      const skip = !cursorId ? Math.max(0, (page - 1) * limit) : undefined;

      entities = await this.prisma.entity.findMany({
        where: whereWithCursor,
        orderBy,
        ...(typeof skip === 'number' ? { skip } : {}),
        take: limit + 1,
        include: {
          category: { select: { key: true, nameEn: true } },
          city: { select: { nameEn: true } },
          locality: { select: { nameEn: true } },
        },
      });
    }

    const hasNext = entities.length > limit;
    const pageRows = hasNext ? entities.slice(0, limit) : entities;

    const items = pageRows.map((e) => ({
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

    const nextCursor = hasNext ? pageRows[pageRows.length - 1]?.id ?? null : null;
    return new CursorPaginatedResponse(items, nextCursor, total);
  }
}
