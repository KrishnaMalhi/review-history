import { IsString, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FollowTargetType } from '@prisma/client';

export class CreateFollowDto {
  @ApiProperty({ enum: FollowTargetType, example: 'entity' })
  @IsEnum(FollowTargetType)
  targetType!: FollowTargetType;

  @ApiProperty({ example: 'c49b8853-9a51-4392-93b0-8cb38950ad8c' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  targetId!: string;
}
