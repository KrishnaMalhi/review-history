import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsArray, MaxLength, Matches, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateReviewDto {
  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating!: number;

  @ApiPropertyOptional({ example: 'Deposit issue' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.REVIEW_TITLE)
  title?: string;

  @ApiProperty({ example: 'In my experience, the deposit was not returned on time.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.REVIEW_BODY)
  body!: string;

  @ApiPropertyOptional({ example: ['deposit_not_returned', 'hidden_charges'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY, { each: true })
  tagKeys?: string[];

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  experienceMonth?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2030)
  experienceYear?: number;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/, { message: 'languageCode must be an ISO language code (e.g. en or en-US)' })
  languageCode?: string;

  @ApiPropertyOptional({ description: 'Category-specific review extension data (workplace, school, medical, product)' })
  @IsOptional()
  @IsObject()
  categoryData?: Record<string, any>;
}
