import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';
import { BlogPostStatusDto } from './create-blog.dto';

export class ListBlogsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'landlord' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SEARCH_Q)
  q?: string;

  @ApiPropertyOptional({ enum: BlogPostStatusDto, example: BlogPostStatusDto.PUBLISHED })
  @IsOptional()
  @IsEnum(BlogPostStatusDto)
  status?: BlogPostStatusDto;

  @ApiPropertyOptional({ example: 'a0d77867-8e2f-4f4a-a219-e0064be4e355' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'a0d77867-8e2f-4f4a-a219-e0064be4e355' })
  @IsOptional()
  @IsUUID()
  tagId?: string;
}
