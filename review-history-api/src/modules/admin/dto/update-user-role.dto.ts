import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['user', 'claimed_owner', 'moderator', 'admin', 'super_admin'] })
  @IsIn(['user', 'claimed_owner', 'moderator', 'admin', 'super_admin'])
  role!: 'user' | 'claimed_owner' | 'moderator' | 'admin' | 'super_admin';
}
