import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClaimVerificationMethod } from '@prisma/client';
import { Transform } from 'class-transformer';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateClaimDto {
  @ApiProperty({ example: 'cnic_upload', description: 'Method of ownership verification' })
  @Transform(({ value }) => {
    if (value === 'cnic_upload') return ClaimVerificationMethod.document;
    return value;
  })
  @IsEnum(ClaimVerificationMethod)
  verificationMethod!: ClaimVerificationMethod;

  @ApiPropertyOptional({ example: 'https://storage.example.com/evidence/doc.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.URL)
  evidenceUrl?: string;
}
