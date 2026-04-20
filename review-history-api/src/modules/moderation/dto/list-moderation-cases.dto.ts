import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListModerationCasesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['open', 'in_progress', 'resolved', 'appealed', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved', 'appealed', 'closed'])
  status?: 'open' | 'in_progress' | 'resolved' | 'appealed' | 'closed';
}
