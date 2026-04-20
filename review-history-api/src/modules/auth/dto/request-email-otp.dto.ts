import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class RequestEmailOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(FIELD_LIMITS.EMAIL)
  email!: string;
}
