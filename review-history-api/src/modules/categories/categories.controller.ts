import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Public } from '../../common/decorators';

@ApiTags('Categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List all active categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get('categories/:categoryKey/tags')
  @ApiOperation({ summary: 'Get warning tags for a category' })
  getTags(@Param('categoryKey') categoryKey: string) {
    return this.categoriesService.getTagsByCategory(categoryKey);
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'List cities (PK by default)' })
  @ApiQuery({ name: 'country', required: false, description: 'ISO country code filter (default: PK)' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by city name' })
  getCities(
    @Query('country') country?: string,
    @Query('q') q?: string,
  ) {
    return this.categoriesService.getCities(country || 'PK', q);
  }

  @Public()
  @Get('cities/:cityId/localities')
  @ApiOperation({ summary: 'Get localities for a city' })
  getLocalities(@Param('cityId') cityId: string) {
    return this.categoriesService.getLocalities(cityId);
  }
}
