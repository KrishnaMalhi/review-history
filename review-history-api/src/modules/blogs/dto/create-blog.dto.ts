import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export enum BlogPostStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateBlogDto {
  @ApiProperty({ example: 'How to Choose a Reliable Landlord in Karachi' })
  @IsString()
  @MinLength(5)
  @MaxLength(FIELD_LIMITS.BLOG_TITLE)
  title!: string;

  @ApiPropertyOptional({ example: 'how-to-choose-reliable-landlord-karachi' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BLOG_SLUG)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;

  @ApiPropertyOptional({ example: 'A quick practical guide for tenants and families.' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BLOG_EXCERPT)
  excerpt?: string;

  @ApiProperty({ example: 'Long-form blog markdown/text content...' })
  @IsString()
  @MinLength(20)
  content!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blogs/landlord-guide.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.URL)
  coverImage?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blogs/landlord-guide.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.URL)
  featuredImage?: string;

  @ApiPropertyOptional({ enum: BlogPostStatusDto, example: BlogPostStatusDto.DRAFT })
  @IsOptional()
  @IsEnum(BlogPostStatusDto)
  status?: BlogPostStatusDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2026-04-22T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readTime?: number;

  @ApiPropertyOptional({ example: 'Choosing a reliable landlord in Karachi' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BLOG_TITLE)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'A practical checklist for tenants to avoid rental scams.' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SEO_DESCRIPTION)
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'Reliable Landlord Checklist' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BLOG_TITLE)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Avoid common renting mistakes with this checklist.' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SEO_DESCRIPTION)
  seoDescription?: string;

  @ApiPropertyOptional({ example: ['landlord', 'tenant', 'karachi'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(FIELD_LIMITS.BLOG_KEYWORD_ITEM, { each: true })
  keywords?: string[];

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blogs/landlord-guide-og.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.URL)
  ogImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://reviewhistory.pk/blog/how-to-choose-reliable-landlord-karachi' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.URL)
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: 'ReviewHistory Team' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BLOG_AUTHOR_NAME)
  authorName?: string;

  @ApiPropertyOptional({ example: 'a0d77867-8e2f-4f4a-a219-e0064be4e355' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['a0d77867-8e2f-4f4a-a219-e0064be4e355'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}
