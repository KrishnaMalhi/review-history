import {
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  IsInt,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

// ─── School Profile ─────────────────────────────
export class CreateSchoolProfileDto {
  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.PROFILE_DESCRIPTION)
  description?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  logoUrl?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  coverImageUrl?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  websiteUrl?: string;

  @IsOptional() @IsString()
  schoolType?: string;

  @IsOptional() @IsString()
  curriculum?: string;

  @IsOptional() @IsInt() @Min(0)
  feeRangeMin?: number;

  @IsOptional() @IsInt() @Min(0)
  feeRangeMax?: number;

  @IsOptional() @IsInt() @Min(1900) @Max(2030)
  foundedYear?: number;

  @IsOptional() @IsInt() @Min(0)
  totalStudents?: number;

  @IsOptional()
  facilities?: string[];

  @IsOptional()
  branches?: any[];
}

// ─── Medical Profile ────────────────────────────
export class CreateMedicalProfileDto {
  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.PROFILE_DESCRIPTION)
  description?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  logoUrl?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  coverImageUrl?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  websiteUrl?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.SPECIALIZATION)
  specialization?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.QUALIFICATIONS)
  qualifications?: string;

  @IsOptional() @IsInt() @Min(0) @Max(70)
  experienceYears?: number;

  @IsOptional() @IsString() @MaxLength(200)
  hospitalAffiliation?: string;

  @IsOptional() @IsInt() @Min(0)
  consultationFee?: number;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.PMDC_NUMBER)
  pmdcNumber?: string;

  @IsOptional()
  timings?: any;

  @IsOptional()
  services?: string[];
}

// ─── Product Profile ────────────────────────────
export class CreateProductProfileDto {
  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.PROFILE_DESCRIPTION)
  description?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.BRAND_NAME)
  brand?: string;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(FIELD_LIMITS.URL)
  imageUrl?: string;

  @IsOptional() @IsString() @MaxLength(100)
  productCategory?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.BARCODE)
  barcode?: string;

  @IsOptional()
  variants?: any[];

  @IsOptional()
  nutrition?: any;
}
