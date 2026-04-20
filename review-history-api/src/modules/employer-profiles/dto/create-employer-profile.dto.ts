import {
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  IsInt,
  IsArray,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployerSize } from '@prisma/client';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateEmployerProfileDto {
  @ApiPropertyOptional({ example: 'Leading software company in Lahore' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.PROFILE_DESCRIPTION)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(FIELD_LIMITS.URL)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(FIELD_LIMITS.URL)
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(FIELD_LIMITS.URL)
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.INDUSTRY)
  industry?: string;

  @ApiPropertyOptional({ enum: EmployerSize, example: 'medium' })
  @IsOptional()
  @IsEnum(EmployerSize)
  employerSize?: EmployerSize;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  foundedYear?: number;

  @ApiPropertyOptional({ example: ['Health Insurance', 'Flexible Hours', 'Transport'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  benefits?: string[];

  @ApiPropertyOptional({ example: { linkedin: 'https://linkedin.com/company/example' } })
  @IsOptional()
  socialLinks?: Record<string, string>;
}
