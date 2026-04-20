import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@prisma/client';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateReportDto {
  @ApiProperty({
    enum: [
      'personal_information',
      'fake_review',
      'wrong_entity',
      'threatening_content',
      'spam',
      'harassment',
      'other',
    ],
  })
  @IsEnum(ReportType)
  reportType!: ReportType;

  @ApiPropertyOptional({ example: 'This review seems to be written by a competitor.' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.REPORT_DESCRIPTION)
  description?: string;
}
