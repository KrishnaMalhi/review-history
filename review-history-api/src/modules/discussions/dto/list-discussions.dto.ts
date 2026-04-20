import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListDiscussionsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'salary offer' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
