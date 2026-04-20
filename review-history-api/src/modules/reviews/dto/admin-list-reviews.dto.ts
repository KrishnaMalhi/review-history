import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class AdminListReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['draft', 'submitted', 'published', 'under_verification', 'hidden', 'removed', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'submitted', 'published', 'under_verification', 'hidden', 'removed', 'archived'])
  status?: string;

  @ApiPropertyOptional({ example: 'karachi landlord' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SEARCH_Q)
  q?: string;
}
