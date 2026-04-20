import { IsOptional, IsInt, IsString, IsBoolean, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

// ─── Workplace Review Data ──────────────────────
export class WorkplaceReviewDataDto {
  @IsOptional() @IsInt() @Min(1) @Max(5)
  workCulture?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  salaryFairness?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  managementQuality?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  careerGrowth?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  workLifeBalance?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  benefitsSatisfaction?: number;

  @IsOptional() @IsInt() @Min(1) @Max(10)
  recommendScore?: number;

  @IsOptional() @IsString() @MaxLength(30)
  employmentStatus?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.JOB_TITLE)
  jobTitle?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.DEPARTMENT_NAME)
  departmentName?: string;

  @IsOptional() @IsInt() @Min(0) @Max(50)
  yearsAtCompany?: number;
}

// ─── School Review Data ─────────────────────────
export class SchoolReviewDataDto {
  @IsOptional() @IsInt() @Min(1) @Max(5)
  teachingQuality?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  discipline?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  environment?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  administration?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  extracurriculars?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  safety?: number;

  @IsOptional() @IsString() @MaxLength(20)
  reviewerType?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.GRADE_CLASS)
  gradeOrClass?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.BRANCH_NAME)
  branchName?: string;

  @IsOptional() @IsInt() @Min(0) @Max(30)
  yearsAttended?: number;
}

// ─── Medical Review Data ────────────────────────
export class MedicalReviewDataDto {
  @IsOptional() @IsInt() @Min(1) @Max(5)
  treatmentEffectiveness?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  diagnosisAccuracy?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  doctorBehavior?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  waitTime?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  staffBehavior?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  cleanliness?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  costFairness?: number;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.CONDITION_TREATED)
  conditionTreated?: string;

  @IsOptional() @IsString() @MaxLength(30)
  visitType?: string;

  @IsOptional() @IsBoolean()
  wouldRecommend?: boolean;
}

// ─── Product Review Data ────────────────────────
export class ProductReviewDataDto {
  @IsOptional() @IsInt() @Min(1) @Max(5)
  taste?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  quality?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  valueForMoney?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  packaging?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  consistency?: number;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.VARIANT)
  variant?: string;

  @IsOptional() @IsString() @MaxLength(FIELD_LIMITS.URL)
  imageUrl?: string;

  @IsOptional() @IsString() @MaxLength(200)
  purchasePlace?: string;
}
