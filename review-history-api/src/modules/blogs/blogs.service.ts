import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateBlogDto, BlogPostStatusDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ListBlogsDto } from './dto/list-blogs.dto';
import { CursorPaginatedResponse } from '../../common/dto/pagination.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: ListBlogsDto) {
    const limit = query.limit || query.pageSize || 12;
    const cursorId = query.cursor;
    const q = query.q?.trim();

    const where: any = {
      deletedAt: null,
      publishedAt: { lte: new Date() },
      OR: [{ status: 'PUBLISHED' }, { isPublished: true }],
    };

    if (q) {
      where.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { keywords: { has: q.toLowerCase() } },
          ],
        },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.tagId) {
      where.tags = { some: { id: query.tagId } };
    }

    if (query.status) {
      where.status = query.status;
    }

    const cursorPost = cursorId
      ? await this.prisma.blogPost.findUnique({
          where: { id: cursorId },
          select: { id: true, publishedAt: true, createdAt: true },
        })
      : null;

    const whereWithCursor = cursorPost
      ? {
          AND: [
            where,
            {
              OR: [
                { publishedAt: { lt: cursorPost.publishedAt || cursorPost.createdAt } },
                {
                  publishedAt: cursorPost.publishedAt || cursorPost.createdAt,
                  id: { lt: cursorPost.id },
                },
              ],
            },
          ],
        }
      : where;

    const [rows, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: whereWithCursor,
        take: limit + 1,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          coverImage: true,
          featuredImage: true,
          status: true,
          publishedAt: true,
          readTime: true,
          views: true,
          seoTitle: true,
          seoDescription: true,
          keywords: true,
          ogImageUrl: true,
          canonicalUrl: true,
          createdAt: true,
          author: { select: { id: true, displayName: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    const hasNext = rows.length > limit;
    const pageRows = hasNext ? rows.slice(0, limit) : rows;
    const nextCursor = hasNext ? pageRows[pageRows.length - 1]?.id ?? null : null;

    return new CursorPaginatedResponse(pageRows, nextCursor, total);
  }

  async getPublicBySlug(slug: string) {
    const blog = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        deletedAt: null,
        publishedAt: { lte: new Date() },
        OR: [{ status: 'PUBLISHED' }, { isPublished: true }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        featuredImage: true,
        status: true,
        publishedAt: true,
        readTime: true,
        views: true,
        metaTitle: true,
        metaDescription: true,
        seoTitle: true,
        seoDescription: true,
        keywords: true,
        ogImageUrl: true,
        canonicalUrl: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!blog) throw new NotFoundException('Blog not found');

    await this.prisma.blogPost.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });

    return { ...blog, views: blog.views + 1 };
  }

  async getAdminById(id: string) {
    const blog = await this.prisma.blogPost.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async listAdmin(query: ListBlogsDto) {
    const limit = query.limit || query.pageSize || 20;
    const cursorId = query.cursor;
    const q = query.q?.trim();

    const where: any = { deletedAt: null };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.tagId) where.tags = { some: { id: query.tagId } };

    const cursorPost = cursorId
      ? await this.prisma.blogPost.findUnique({
          where: { id: cursorId },
          select: { id: true, createdAt: true },
        })
      : null;

    const whereWithCursor = cursorPost
      ? {
          AND: [
            where,
            {
              OR: [
                { createdAt: { lt: cursorPost.createdAt } },
                { createdAt: cursorPost.createdAt, id: { lt: cursorPost.id } },
              ],
            },
          ],
        }
      : where;

    const [rows, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: whereWithCursor,
        take: limit + 1,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          author: { select: { id: true, displayName: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    const hasNext = rows.length > limit;
    const pageRows = hasNext ? rows.slice(0, limit) : rows;
    const nextCursor = hasNext ? pageRows[pageRows.length - 1]?.id ?? null : null;
    return new CursorPaginatedResponse(pageRows, nextCursor, total);
  }

  async create(dto: CreateBlogDto, adminUserId: string) {
    const slug = await this.ensureUniqueSlug(dto.slug || this.slugify(dto.title));
    const status = this.resolveStatus(dto.status, dto.isPublished);
    const publishedAt = this.resolvePublishedAt(status, dto.publishedAt);

    const blog = await this.prisma.blogPost.create({
      data: {
        authorUserId: adminUserId,
        title: sanitizeInput(dto.title),
        slug,
        excerpt: dto.excerpt ? sanitizeInput(dto.excerpt) : null,
        content: sanitizeInput(dto.content),
        coverImage: dto.coverImage ? sanitizeInput(dto.coverImage) : dto.featuredImage ? sanitizeInput(dto.featuredImage) : null,
        featuredImage: dto.featuredImage ? sanitizeInput(dto.featuredImage) : dto.coverImage ? sanitizeInput(dto.coverImage) : null,
        status,
        isPublished: status === BlogPostStatusDto.PUBLISHED,
        publishedAt,
        readTime: dto.readTime ?? this.calculateReadTime(dto.content),
        metaTitle: dto.metaTitle ? sanitizeInput(dto.metaTitle) : null,
        metaDescription: dto.metaDescription ? sanitizeInput(dto.metaDescription) : null,
        seoTitle: dto.seoTitle ? sanitizeInput(dto.seoTitle) : null,
        seoDescription: dto.seoDescription ? sanitizeInput(dto.seoDescription) : null,
        keywords: (dto.keywords ?? []).map((k) => k.trim().toLowerCase()).filter(Boolean),
        ogImageUrl: dto.ogImageUrl ? sanitizeInput(dto.ogImageUrl) : null,
        canonicalUrl: dto.canonicalUrl ? sanitizeInput(dto.canonicalUrl) : null,
        authorName: dto.authorName ? sanitizeInput(dto.authorName) : null,
        categoryId: dto.categoryId ?? null,
        ...(dto.tagIds?.length ? { tags: { connect: dto.tagIds.map((id) => ({ id })) } } : {}),
      },
      include: {
        author: { select: { id: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
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

    const status = this.resolveStatus(dto.status, dto.isPublished, current.status as BlogPostStatusDto);
    const publishedAt = dto.publishedAt !== undefined
      ? this.resolvePublishedAt(status, dto.publishedAt)
      : current.publishedAt
        ? current.publishedAt
        : this.resolvePublishedAt(status, undefined);

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? sanitizeInput(dto.title) : undefined,
        slug: nextSlug,
        excerpt: dto.excerpt !== undefined ? (dto.excerpt ? sanitizeInput(dto.excerpt) : null) : undefined,
        content: dto.content !== undefined ? sanitizeInput(dto.content) : undefined,
        coverImage:
          dto.coverImage !== undefined
            ? dto.coverImage ? sanitizeInput(dto.coverImage) : null
            : dto.featuredImage !== undefined
              ? dto.featuredImage ? sanitizeInput(dto.featuredImage) : null
              : undefined,
        featuredImage:
          dto.featuredImage !== undefined
            ? dto.featuredImage ? sanitizeInput(dto.featuredImage) : null
            : dto.coverImage !== undefined
              ? dto.coverImage ? sanitizeInput(dto.coverImage) : null
              : undefined,
        status,
        isPublished: status === BlogPostStatusDto.PUBLISHED,
        publishedAt,
        readTime: dto.readTime ?? (dto.content ? this.calculateReadTime(dto.content) : undefined),
        metaTitle: dto.metaTitle !== undefined ? (dto.metaTitle ? sanitizeInput(dto.metaTitle) : null) : undefined,
        metaDescription:
          dto.metaDescription !== undefined ? (dto.metaDescription ? sanitizeInput(dto.metaDescription) : null) : undefined,
        seoTitle: dto.seoTitle !== undefined ? (dto.seoTitle ? sanitizeInput(dto.seoTitle) : null) : undefined,
        seoDescription:
          dto.seoDescription !== undefined ? (dto.seoDescription ? sanitizeInput(dto.seoDescription) : null) : undefined,
        keywords: dto.keywords !== undefined ? dto.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean) : undefined,
        ogImageUrl: dto.ogImageUrl !== undefined ? (dto.ogImageUrl ? sanitizeInput(dto.ogImageUrl) : null) : undefined,
        canonicalUrl:
          dto.canonicalUrl !== undefined ? (dto.canonicalUrl ? sanitizeInput(dto.canonicalUrl) : null) : undefined,
        authorName: dto.authorName !== undefined ? (dto.authorName ? sanitizeInput(dto.authorName) : null) : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
        ...(dto.tagIds !== undefined ? { tags: { set: dto.tagIds.map((tagId) => ({ id: tagId })) } } : {}),
      },
      include: {
        author: { select: { id: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Blog not found');

    await this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), status: BlogPostStatusDto.ARCHIVED, isPublished: false },
    });

    return { message: 'Blog deleted' };
  }

  async listPublicCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, description: true },
    });
  }

  async listAdminCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { blogPosts: true },
        },
      },
    });
  }

  async createCategory(dto: CreateBlogCategoryDto) {
    const slug = await this.ensureUniqueCategorySlug(dto.slug || this.slugify(dto.name));
    return this.prisma.blogCategory.create({
      data: {
        name: sanitizeInput(dto.name),
        slug,
        description: dto.description ? sanitizeInput(dto.description) : null,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateBlogCategoryDto) {
    const current = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Category not found');

    const slug = dto.slug
      ? await this.ensureUniqueCategorySlug(this.slugify(dto.slug), id)
      : dto.name
        ? await this.ensureUniqueCategorySlug(this.slugify(dto.name), id)
        : undefined;

    return this.prisma.blogCategory.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? sanitizeInput(dto.name) : undefined,
        slug,
        description: dto.description !== undefined ? (dto.description ? sanitizeInput(dto.description) : null) : undefined,
      },
    });
  }

  async deleteCategory(id: string) {
    const postsCount = await this.prisma.blogPost.count({ where: { categoryId: id, deletedAt: null } });
    if (postsCount > 0) {
      throw new ConflictException('Cannot delete category with linked posts');
    }
    await this.prisma.blogCategory.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  async listPublicTags() {
    return this.prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async listAdminTags() {
    return this.prisma.blogTag.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { blogPosts: true },
        },
      },
    });
  }

  async createTag(dto: CreateBlogTagDto) {
    const slug = await this.ensureUniqueTagSlug(dto.slug || this.slugify(dto.name));
    return this.prisma.blogTag.create({
      data: {
        name: sanitizeInput(dto.name),
        slug,
      },
    });
  }

  async updateTag(id: string, dto: UpdateBlogTagDto) {
    const current = await this.prisma.blogTag.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Tag not found');

    const slug = dto.slug
      ? await this.ensureUniqueTagSlug(this.slugify(dto.slug), id)
      : dto.name
        ? await this.ensureUniqueTagSlug(this.slugify(dto.name), id)
        : undefined;

    return this.prisma.blogTag.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? sanitizeInput(dto.name) : undefined,
        slug,
      },
    });
  }

  async deleteTag(id: string) {
    const tag = await this.prisma.blogTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    await this.prisma.blogTag.update({
      where: { id },
      data: { blogPosts: { set: [] } },
    });
    await this.prisma.blogTag.delete({ where: { id } });

    return { message: 'Tag deleted' };
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

  private resolveStatus(
    status?: BlogPostStatusDto,
    isPublished?: boolean,
    fallback: BlogPostStatusDto = BlogPostStatusDto.DRAFT,
  ): BlogPostStatusDto {
    if (status) return status;
    if (isPublished === true) return BlogPostStatusDto.PUBLISHED;
    if (isPublished === false) return BlogPostStatusDto.DRAFT;
    return fallback;
  }

  private resolvePublishedAt(status: BlogPostStatusDto, publishedAt?: string) {
    if (status !== BlogPostStatusDto.PUBLISHED) return null;
    if (publishedAt) return new Date(publishedAt);
    return new Date();
  }

  private calculateReadTime(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
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

  private async ensureUniqueCategorySlug(slug: string, ignoreId?: string) {
    const base = this.slugify(slug).slice(0, 120);
    let candidate = base;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogCategory.findFirst({
        where: {
          slug: candidate,
          ...(ignoreId ? { id: { not: ignoreId } } : {}),
        },
        select: { id: true },
      });
      if (!existing) return candidate;
      counter += 1;
      candidate = `${base}-${counter}`.slice(0, 120);
      if (counter > 1000) throw new ConflictException('Could not allocate a unique category slug');
    }
  }

  private async ensureUniqueTagSlug(slug: string, ignoreId?: string) {
    const base = this.slugify(slug).slice(0, 120);
    let candidate = base;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogTag.findFirst({
        where: {
          slug: candidate,
          ...(ignoreId ? { id: { not: ignoreId } } : {}),
        },
        select: { id: true },
      });
      if (!existing) return candidate;
      counter += 1;
      candidate = `${base}-${counter}`.slice(0, 120);
      if (counter > 1000) throw new ConflictException('Could not allocate a unique tag slug');
    }
  }
}
