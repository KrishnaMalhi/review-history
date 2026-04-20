import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModerationActionType } from '@prisma/client';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ResolveCaseDto {
  @ApiProperty({ enum: ['keep', 'label', 'redact', 'hide_review', 'remove_review', 'suspend_user', 'ban_user', 'merge_entity', 'close_case', 'escalate'] })
  @IsEnum(ModerationActionType)
  actionType!: ModerationActionType;

  @ApiPropertyOptional({ example: 'Content verified as legitimate.' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.MODERATION_NOTES)
  notes?: string;
}
