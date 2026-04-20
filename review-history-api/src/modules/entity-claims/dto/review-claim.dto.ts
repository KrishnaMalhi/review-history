import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ReviewClaimDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  action!: 'approved' | 'rejected';

  @ApiPropertyOptional({ example: 'Documents verified successfully' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CLAIM_REASON)
  reason?: string;
}
