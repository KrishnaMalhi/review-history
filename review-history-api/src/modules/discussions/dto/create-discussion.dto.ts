import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDiscussionDto {
  @ApiPropertyOptional({ example: 'Need advice before accepting this job offer' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ example: 'I have an offer from two companies, one has better salary...' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
