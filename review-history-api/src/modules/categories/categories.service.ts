import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        key: true,
        nameEn: true,
        nameUr: true,
        icon: true,
        description: true,
        sortOrder: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      name: row.nameEn,
      nameEn: row.nameEn,
      nameUr: row.nameUr,
      icon: row.icon || 'Tag',
      description: row.description || '',
      sortOrder: row.sortOrder,
    }));
  }

  async getTagsByCategory(categoryKey: string) {
    const rows = await this.prisma.warningTag.findMany({
      where: {
        category: { key: categoryKey },
        isActive: true,
      },
      select: {
        id: true,
        key: true,
        labelEn: true,
        labelUr: true,
        severityWeight: true,
        isPositive: true,
      },
      orderBy: { severityWeight: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      label: row.labelEn,
      labelEn: row.labelEn,
      labelUr: row.labelUr,
      severityWeight: row.severityWeight,
      isPositive: row.isPositive,
    }));
  }

  async getCities() {
    const rows = await this.prisma.city.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        nameUr: true,
        province: true,
        country: { select: { id: true, name: true, isoCode: true, phoneCode: true, currency: true } },
        state: { select: { id: true, name: true, isoCode: true } },
        timezone: { select: { id: true, zoneName: true, gmtOffset: true, gmtOffsetName: true, abbreviation: true, tzName: true } },
      },
      orderBy: { nameEn: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.nameEn,
      nameEn: row.nameEn,
      nameUr: row.nameUr,
      province: row.province,
      country: row.country,
      state: row.state,
      timezone: row.timezone,
    }));
  }

  async getLocalities(cityId: string) {
    const rows = await this.prisma.locality.findMany({
      where: { cityId, isActive: true },
      select: { id: true, nameEn: true, nameUr: true, postalCode: true },
      orderBy: { nameEn: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.nameEn,
      nameEn: row.nameEn,
      nameUr: row.nameUr,
      postalCode: row.postalCode,
    }));
  }
}
