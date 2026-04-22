import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { sanitizeInput } from '../../common/utils/helpers';

@Injectable()
export class ResponseTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    titleEn: string;
    titleUr?: string;
    bodyEn: string;
    bodyUr?: string;
    sentiment: string;
    categoryKey?: string;
    sortOrder?: number;
  }) {
    return this.prisma.responseTemplate.create({
      data: {
        titleEn: sanitizeInput(data.titleEn),
        titleUr: data.titleUr ? sanitizeInput(data.titleUr) : null,
        bodyEn: sanitizeInput(data.bodyEn),
        bodyUr: data.bodyUr ? sanitizeInput(data.bodyUr) : null,
        sentiment: data.sentiment,
        categoryKey: data.categoryKey || null,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async list(categoryKey?: string, sentiment?: string) {
    const where: any = { isActive: true };
    if (categoryKey) where.categoryKey = categoryKey;
    if (sentiment) where.sentiment = sentiment;

    return this.prisma.responseTemplate.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getById(templateId: string) {
    const template = await this.prisma.responseTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(
    templateId: string,
    data: {
      titleEn?: string;
      titleUr?: string;
      bodyEn?: string;
      bodyUr?: string;
      isActive?: boolean;
      sentiment?: string;
      categoryKey?: string;
    },
  ) {
    const template = await this.prisma.responseTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.responseTemplate.update({
      where: { id: templateId },
      data: {
        ...(data.titleEn !== undefined && { titleEn: sanitizeInput(data.titleEn) }),
        ...(data.titleUr !== undefined && { titleUr: data.titleUr ? sanitizeInput(data.titleUr) : null }),
        ...(data.bodyEn !== undefined && { bodyEn: sanitizeInput(data.bodyEn) }),
        ...(data.bodyUr !== undefined && { bodyUr: data.bodyUr ? sanitizeInput(data.bodyUr) : null }),
        ...(data.sentiment !== undefined && { sentiment: data.sentiment }),
        ...(data.categoryKey !== undefined && { categoryKey: data.categoryKey || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async delete(templateId: string) {
    const template = await this.prisma.responseTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    await this.prisma.responseTemplate.delete({ where: { id: templateId } });
    return { message: 'Template deleted' };
  }
}
