import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ReactDiscussionDto {
  @ApiProperty({ enum: ['like', 'dislike'] })
  @IsIn(['like', 'dislike'])
  type!: 'like' | 'dislike';
}
