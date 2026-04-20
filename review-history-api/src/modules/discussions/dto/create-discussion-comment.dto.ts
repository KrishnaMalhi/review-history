import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDiscussionCommentDto {
  @ApiProperty({ example: 'You should negotiate and ask for written policy details.' })
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  body!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
