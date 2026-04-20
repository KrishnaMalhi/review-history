import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['active', 'suspended', 'banned', 'deleted'] })
  @IsIn(['active', 'suspended', 'banned', 'deleted'])
  status!: 'active' | 'suspended' | 'banned' | 'deleted';
}
