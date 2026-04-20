import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(FIELD_LIMITS.EMAIL)
  email!: string;

  @ApiProperty({ example: 'Krishna!@12' })
  @IsString()
  @MinLength(8)
  @MaxLength(FIELD_LIMITS.PASSWORD)
  password!: string;

  @ApiProperty({ example: '03001234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.PHONE)
  @Matches(/^(\+92|03)\d{9,10}$/, {
    message: 'Phone must be a valid Pakistani number (e.g., +923001234567 or 03001234567)',
  })
  phone!: string;

  @ApiProperty({ example: 'Display Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.DISPLAY_NAME)
  displayName?: string;
}
