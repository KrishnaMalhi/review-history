import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateDiscussionDto {
  @ApiPropertyOptional({ example: 'Need advice before accepting this job offer' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.DISCUSSION_TITLE)
  title?: string;

  @ApiProperty({ example: 'I have an offer from two companies, one has better salary...' })
  @IsString()
  @MinLength(10)
  @MaxLength(FIELD_LIMITS.DISCUSSION_BODY)
  body!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
