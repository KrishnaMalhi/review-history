import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class LoginUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(FIELD_LIMITS.EMAIL)
  email!: string;

  @ApiProperty({ example: 'Krishna!@12' })
  @IsString()
  @MinLength(8)
  @MaxLength(FIELD_LIMITS.PASSWORD)
  password!: string;
}
