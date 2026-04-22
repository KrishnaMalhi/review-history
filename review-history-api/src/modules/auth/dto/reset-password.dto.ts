import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset_pwd_abc123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.RESET_TOKEN)
  resetToken!: string;

  @ApiProperty({ example: 'NewStrongPass#123' })
  @IsString()
  @MinLength(8)
  @MaxLength(FIELD_LIMITS.PASSWORD)
  newPassword!: string;
}
