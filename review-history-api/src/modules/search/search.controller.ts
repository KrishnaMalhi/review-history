import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchEntitiesDto } from './dto/search-entities.dto';
import { Public } from '../../common/decorators';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('entities')
  @ApiOperation({ summary: 'Search entities with filters' })
  search(@Query() query: SearchEntitiesDto) {
    return this.searchService.searchEntities(query);
  }
}
