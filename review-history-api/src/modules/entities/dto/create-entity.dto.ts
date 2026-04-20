import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

const UUID_LIKE_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class CreateEntityDto {
  @ApiProperty({ example: 'landlord' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.CATEGORY_KEY)
  @Matches(/^[a-z0-9_-]+$/, { message: 'Category key is invalid' })
  categoryKey!: string;

  @ApiProperty({ example: 'Haji Muhammad Akram' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.ENTITY_NAME)
  displayName!: string;

  @ApiProperty({ example: '00000000-0000-0000-0000-000000000002' })
  @IsNotEmpty()
  @Matches(UUID_LIKE_REGEX, { message: 'cityId must be a valid ID format' })
  cityId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(UUID_LIKE_REGEX, { message: 'localityId must be a valid ID format' })
  localityId?: string;

  @ApiPropertyOptional({ example: '+923001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.PHONE)
  @Matches(/^(\+92|03)\d{9,10}$/, { message: 'Phone must be a valid Pakistani number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'House 47, Street 3' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.ADDRESS_LINE)
  addressLine?: string;

  @ApiPropertyOptional({ example: 'Near main market' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.LANDMARK)
  landmark?: string;
}
