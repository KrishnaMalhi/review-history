import { IsString, IsOptional, MaxLength, Matches, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ahmed Khan' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.DISPLAY_NAME)
  displayName?: string;

  @ApiPropertyOptional({ example: 'ahmed-khan' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.USERNAME)
  @Matches(/^[a-z0-9-]+$/, { message: 'Username must contain only lowercase letters, numbers, and hyphens' })
  usernameSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ example: 'Lahore', description: 'City name alias (frontend compatibility)' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.DISPLAY_NAME)
  city?: string;

  @ApiPropertyOptional({ example: 'Short bio', description: 'Accepted for compatibility; persistence optional' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.BIO)
  bio?: string;
}
