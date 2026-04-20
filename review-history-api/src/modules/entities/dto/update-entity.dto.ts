import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class UpdateEntityDto {
  @ApiPropertyOptional({ example: 'House 47, Street 3, Block B' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.ADDRESS_LINE)
  addressLine?: string;

  @ApiPropertyOptional({ example: 'Near main market' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.LANDMARK)
  landmark?: string;

  @ApiPropertyOptional({ example: '+923001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.PHONE)
  @Matches(/^(\+92|03)\d{9,10}$/, { message: 'Phone must be a valid Pakistani number' })
  phone?: string;
}
