import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class CastVoteDto {
  @ApiProperty({ enum: ['helpful', 'not_helpful', 'seems_fake'] })
  @IsEnum(VoteType)
  voteType!: VoteType;
}
