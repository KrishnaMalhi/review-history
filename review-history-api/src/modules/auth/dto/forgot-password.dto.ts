import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(FIELD_LIMITS.EMAIL)
  email!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  adminOnly?: boolean;
}

