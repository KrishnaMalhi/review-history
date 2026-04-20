import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class VerifyEmailOtpDto {
  @ApiProperty({ example: 'email_otp_req_abc123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FIELD_LIMITS.OTP_REQUEST_ID)
  otpRequestId!: string;

  @ApiProperty({ example: '482911' })
  @IsString()
  @Length(FIELD_LIMITS.OTP_CODE, FIELD_LIMITS.OTP_CODE, { message: 'OTP code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP code must be numeric' })
  code!: string;
}
