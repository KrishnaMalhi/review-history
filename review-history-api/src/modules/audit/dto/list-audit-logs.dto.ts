import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ListAuditLogsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'entity_claim.approved' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.ACTION)
  action?: string;

  @ApiPropertyOptional({ example: 'review' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.OBJECT_TYPE)
  objectType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}
