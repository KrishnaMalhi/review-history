import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ListBlogsDto } from './dto/list-blogs.dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { sanitizeInput } from '../../common/utils/helpers';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: ListBlogsDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 12;
    const skip = (page - 1) * pageSize;
    const q = query.q?.trim();

    const where: any = {
      deletedAt: null,
      isPublished: true,
      publishedAt: { lte: new Date() },
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { id: true, displayName: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return new PaginatedResponse(rows, total, page, pageSize);
  }

  async getPublicBySlug(slug: string) {
    const blog = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        deletedAt: null,
        isPublished: true,
        publishedAt: { lte: new Date() },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, displayName: true } },
      },
    });

    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async listAdmin(query: ListBlogsDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const q = query.q?.trim();

    const where: any = { deletedAt: null };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, displayName: true } } },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return new PaginatedResponse(rows, total, page, pageSize);
  }

  async create(dto: CreateBlogDto, adminUserId: string) {
    const slug = await this.ensureUniqueSlug(dto.slug || this.slugify(dto.title));

    const blog = await this.prisma.blogPost.create({
      data: {
        authorUserId: adminUserId,
        title: sanitizeInput(dto.title),
        slug,
        excerpt: dto.excerpt ? sanitizeInput(dto.excerpt) : null,
        content: sanitizeInput(dto.content),
        coverImage: dto.coverImage ? sanitizeInput(dto.coverImage) : null,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
      },
    });

    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    const current = await this.prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
    if (!current) throw new NotFoundException('Blog not found');

    const nextSlug = dto.slug
      ? await this.ensureUniqueSlug(this.slugify(dto.slug), id)
      : dto.title
        ? await this.ensureUniqueSlug(this.slugify(dto.title), id)
        : undefined;

    const isPublishingNow = dto.isPublished === true && !current.isPublished;

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? sanitizeInput(dto.title) : undefined,
        slug: nextSlug,
        excerpt: dto.excerpt !== undefined ? (dto.excerpt ? sanitizeInput(dto.excerpt) : null) : undefined,
        content: dto.content !== undefined ? sanitizeInput(dto.content) : undefined,
        coverImage: dto.coverImage !== undefined ? (dto.coverImage ? sanitizeInput(dto.coverImage) : null) : undefined,
        isPublished: dto.isPublished,
        publishedAt:
          dto.isPublished === false
            ? null
            : isPublishingNow
              ? new Date()
              : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Blog not found');

    await this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });

    return { message: 'Blog deleted' };
  }

  private slugify(value: string) {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 220);

    if (!slug) throw new BadRequestException('Unable to generate a valid slug');
    return slug;
  }

  private async ensureUniqueSlug(slug: string, ignoreId?: string) {
    const base = this.slugify(slug);
    let candidate = base;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogPost.findFirst({
        where: {
          slug: candidate,
          deletedAt: null,
          ...(ignoreId ? { id: { not: ignoreId } } : {}),
        },
        select: { id: true },
      });

      if (!existing) return candidate;
      counter += 1;
      candidate = `${base}-${counter}`.slice(0, 220);
      if (counter > 1000) {
        throw new ConflictException('Could not allocate a unique slug');
      }
    }
  }
}
