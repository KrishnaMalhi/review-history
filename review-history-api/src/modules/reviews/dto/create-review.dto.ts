import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
  MaxLength,
  Matches,
  ValidateNested,
  IsObject,
  IsUrl,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';
import {
  MedicalReviewDataDto,
  ProductReviewDataDto,
  SchoolReviewDataDto,
  WorkplaceReviewDataDto,
} from '../../category-extensions/dto/category-review-data.dto';

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
  @MaxLength(FIELD_LIMITS.LANGUAGE_CODE)
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/, { message: 'languageCode must be an ISO language code (e.g. en or en-US)' })
  languageCode?: string;

  @ApiPropertyOptional({ description: 'Category-specific review extension data (workplace, school, medical, product)' })
  @IsOptional()
  @IsObject()
  categoryData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Invite token from /r/:token route' })
  @IsOptional()
  @IsString()
  @Length(64, 64)
  inviteToken?: string;

  @ApiPropertyOptional({ type: WorkplaceReviewDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkplaceReviewDataDto)
  workplace?: WorkplaceReviewDataDto;

  @ApiPropertyOptional({ type: SchoolReviewDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SchoolReviewDataDto)
  school?: SchoolReviewDataDto;

  @ApiPropertyOptional({ type: MedicalReviewDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalReviewDataDto)
  medical?: MedicalReviewDataDto;

  @ApiPropertyOptional({ type: ProductReviewDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductReviewDataDto)
  product?: ProductReviewDataDto;

  @ApiPropertyOptional({
    description: 'URLs of supporting evidence files (uploaded via POST /upload). Max 5 items.',
    example: ['http://localhost:5000/uploads/abc.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  evidenceUrls?: string[];
}
