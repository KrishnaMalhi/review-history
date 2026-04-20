import { IsString, IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class VerifyOtpDto {
  @ApiProperty({ example: 'otp_req_abc123', description: 'OTP request identifier' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.OTP_REQUEST_ID)
  otpRequestId!: string;

  @ApiProperty({ example: '482911', description: '6-digit OTP code' })
  @IsString()
  @IsNotEmpty()
  @Length(FIELD_LIMITS.OTP_CODE, FIELD_LIMITS.OTP_CODE, { message: 'OTP code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP code must be numeric' })
  code!: string;
}
