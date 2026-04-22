import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ListDiscussionsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'salary offer' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SEARCH_Q)
  q?: string;
}
