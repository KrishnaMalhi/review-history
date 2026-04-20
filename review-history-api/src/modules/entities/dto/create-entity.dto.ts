import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

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
  @IsUUID()
  @IsNotEmpty()
  cityId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
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
