import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['newest', 'highest', 'lowest', 'helpful'] })
  @IsOptional()
  @IsIn(['newest', 'highest', 'lowest', 'helpful'])
  sort?: string = 'newest';
}
