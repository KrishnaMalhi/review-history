import { IsOptional, IsString, IsIn, IsInt, Min, Max, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

const UUID_LIKE_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class SearchEntitiesDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'ahmed landlord' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SEARCH_Q)
  q?: string;

  @ApiPropertyOptional({ example: 'landlord' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY)
  category?: string;

  @ApiPropertyOptional({ example: 'landlord' })
  @Transform(({ obj, value }) => value ?? obj.category, { toClassOnly: true })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY)
  categoryKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.DISPLAY_NAME)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(UUID_LIKE_REGEX, { message: 'cityId must be a valid ID format' })
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(UUID_LIKE_REGEX, { message: 'localityId must be a valid ID format' })
  localityId?: string;

  @ApiPropertyOptional({
    enum: ['recommended', 'newest', 'rating', 'reviews', 'name', 'rating_desc', 'rating_asc', 'reviews_desc', 'trust_desc'],
  })
  @IsOptional()
  @IsIn(['recommended', 'newest', 'rating', 'reviews', 'name', 'rating_desc', 'rating_asc', 'reviews_desc', 'trust_desc'])
  @MaxLength(FIELD_LIMITS.SEARCH_SORT)
  sort?: string = 'recommended';

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

}
