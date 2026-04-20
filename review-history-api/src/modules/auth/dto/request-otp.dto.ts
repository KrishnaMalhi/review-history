import { IsString, Matches, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class RequestOtpDto {
  @ApiProperty({ example: '+923001234567', description: 'Pakistani phone number in E.164 format' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.PHONE)
  @Matches(/^(\+92|03)\d{9,10}$/, {
    message: 'Phone must be a valid Pakistani number (e.g., +923001234567 or 03001234567)',
  })
  phone!: string;
}
