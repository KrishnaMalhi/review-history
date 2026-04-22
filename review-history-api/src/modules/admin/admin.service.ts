import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalEntities,
      totalReviews,
      pendingModeration,
      pendingClaims,
    ] = await Promise.all([
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.entity.count({ where: { deletedAt: null } }),
      this.prisma.review.count({ where: { deletedAt: null } }),
      this.prisma.moderationCase.count({ where: { status: { notIn: ['resolved', 'closed'] } } }),
      this.prisma.entityClaim.count({ where: { status: 'pending' } }),
    ]);

    return {
      totalUsers,
      totalEntities,
      totalReviews,
      pendingModeration,
      openModerationCases: pendingModeration,
      pendingClaims,
    };
  }

  async listUsers(page: number = 1, pageSize: number = 50, role?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (role) where.role = role;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneE164: true,
          displayName: true,
          role: true,
          status: true,
          trustLevel: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponse(items, total, page, pageSize);
  }

  async updateUserStatus(userId: string, status: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  // ─── CATEGORIES CRUD ──────────────────────────────────

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { warningTags: true, entities: true } } },
    });
  }

  async createCategory(data: CreateCategoryDto) {
    const key = data.key.trim().toLowerCase();
    const existing = await this.prisma.category.findUnique({ where: { key } });
    if (existing) throw new ConflictException(`Category with key "${key}" already exists`);

    return this.prisma.category.create({
      data: {
        key,
        nameEn: sanitizeInput(data.nameEn),
        nameUr: sanitizeInput(data.nameUr),
        icon: data.icon ? sanitizeInput(data.icon) : 'Tag',
        description: data.description ? sanitizeInput(data.description) : '',
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const nextKey = data.key?.trim().toLowerCase();
    if (nextKey && nextKey !== category.key) {
      const existing = await this.prisma.category.findUnique({ where: { key: nextKey } });
      if (existing) throw new ConflictException(`Category with key "${nextKey}" already exists`);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        key: nextKey,
        nameEn: data.nameEn !== undefined ? sanitizeInput(data.nameEn) : undefined,
        nameUr: data.nameUr !== undefined ? sanitizeInput(data.nameUr) : undefined,
        icon: data.icon !== undefined ? sanitizeInput(data.icon) : undefined,
        description: data.description !== undefined ? sanitizeInput(data.description) : undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { entities: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');

    if (category._count.entities > 0) {
      // Soft-delete: just deactivate if entities reference it
      return this.prisma.category.update({ where: { id }, data: { isActive: false } });
    }

    return this.prisma.category.delete({ where: { id } });
  }

  // ─── REPORTS ──────────────────────────────────

  async listReports(page: number = 1, pageSize: number = 50, reportType?: string, status?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (reportType) where.reportType = reportType;
    if (status) where.status = status;

    const [rawItems, total] = await Promise.all([
      this.prisma.reviewReport.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          review: {
            select: {
              id: true,
              body: true,
              overallRating: true,
              entity: { select: { id: true, displayName: true } },
            },
          },
          reporter: { select: { id: true, displayName: true, phoneE164: true } },
        },
      }),
      this.prisma.reviewReport.count({ where }),
    ]);

    const items = rawItems.map((item) => ({
      ...item,
      review: item.review
        ? {
            ...item.review,
            rating: item.review.overallRating,
            entity: item.review.entity
              ? {
                  id: item.review.entity.id,
                  name: item.review.entity.displayName,
                }
              : null,
          }
        : null,
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }
}
