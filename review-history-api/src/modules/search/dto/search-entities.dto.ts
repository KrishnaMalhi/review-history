import { IsOptional, IsString, IsIn, IsInt, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

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
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  localityId?: string;

  @ApiPropertyOptional({
    enum: ['newest', 'rating', 'reviews', 'name', 'rating_desc', 'rating_asc', 'reviews_desc', 'trust_desc'],
  })
  @IsOptional()
  @IsIn(['newest', 'rating', 'reviews', 'name', 'rating_desc', 'rating_asc', 'reviews_desc', 'trust_desc'])
  @MaxLength(FIELD_LIMITS.SEARCH_SORT)
  sort?: string = 'newest';

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

}
