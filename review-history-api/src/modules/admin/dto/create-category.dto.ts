import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateCategoryDto {
  @ApiProperty({ example: 'landlord' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY)
  @Matches(/^[a-z0-9_-]+$/, { message: 'key must contain only lowercase letters, numbers, hyphens, and underscores' })
  key!: string;

  @ApiProperty({ example: 'Landlord' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_NAME_EN)
  nameEn!: string;

  @ApiProperty({ example: 'مالک مکان' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_NAME_UR)
  nameUr!: string;

  @ApiPropertyOptional({ example: 'Tag' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_ICON)
  icon?: string;

  @ApiPropertyOptional({ example: 'Landlords and property owners' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.CATEGORY_DESCRIPTION)
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;
}
