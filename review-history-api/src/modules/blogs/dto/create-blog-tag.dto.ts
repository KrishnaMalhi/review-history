import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateBlogTagDto {
  @ApiProperty({ example: 'career-growth' })
  @IsString()
  @MinLength(2)
  @MaxLength(FIELD_LIMITS.CATEGORY_NAME_EN)
  name!: string;

  @ApiPropertyOptional({ example: 'career-growth' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BLOG_SLUG)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;
}
