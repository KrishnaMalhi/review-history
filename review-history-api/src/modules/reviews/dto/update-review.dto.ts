import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.REVIEW_TITLE)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated experience text.' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.REVIEW_BODY)
  body?: string;
}
