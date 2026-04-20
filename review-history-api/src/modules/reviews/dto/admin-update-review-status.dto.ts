import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class AdminUpdateReviewStatusDto {
  @ApiProperty({ enum: ['published', 'hidden', 'removed', 'under_verification'] })
  @IsIn(['published', 'hidden', 'removed', 'under_verification'])
  status!: 'published' | 'hidden' | 'removed' | 'under_verification';
}
