import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ReviewFeedQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'landlord' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY)
  @Matches(/^[a-z0-9_-]+$/, { message: 'category must contain only lowercase letters, numbers, hyphens, and underscores' })
  category?: string;
}
