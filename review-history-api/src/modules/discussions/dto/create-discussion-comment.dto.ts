import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateDiscussionCommentDto {
  @ApiProperty({ example: 'You should negotiate and ask for written policy details.' })
  @IsString()
  @MinLength(2)
  @MaxLength(FIELD_LIMITS.COMMENT_BODY)
  body!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
