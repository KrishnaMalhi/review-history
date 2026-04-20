import { IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FollowTargetType } from '@prisma/client';

export class CreateFollowDto {
  @ApiProperty({ enum: FollowTargetType, example: 'entity' })
  @IsEnum(FollowTargetType)
  targetType!: FollowTargetType;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  targetId!: string;
}
