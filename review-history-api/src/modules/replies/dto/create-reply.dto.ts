import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FIELD_LIMITS } from '../../../common/constants/field-limits';

export class CreateReplyDto {
  @ApiProperty({ example: 'Thank you for the feedback. We have addressed your concern.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(FIELD_LIMITS.REPLY_BODY)
  body!: string;
}
