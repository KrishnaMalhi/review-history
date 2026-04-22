import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, Matches, IsIn, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ReviewFeedQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'landlord' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY)
  @Matches(/^[a-z0-9_-]+$/, { message: 'category must contain only lowercase letters, numbers, hyphens, and underscores' })
  category?: string;

  @ApiPropertyOptional({ enum: ['recent', 'helpful', 'trending'], default: 'recent' })
  @IsOptional()
  @IsIn(['recent', 'helpful', 'trending'])
  sort?: 'recent' | 'helpful' | 'trending' = 'recent';

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  following?: boolean;
}
