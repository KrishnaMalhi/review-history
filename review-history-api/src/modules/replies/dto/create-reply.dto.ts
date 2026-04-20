import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @ApiProperty({ example: 'Thank you for the feedback. We have addressed your concern.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body!: string;
}
