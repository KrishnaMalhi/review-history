import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List all active cities' })
  getCities() {
    return this.categoriesService.getCities();
  }

  @Public()
  @Get('cities/:cityId/localities')
  @ApiOperation({ summary: 'Get localities for a city' })
  getLocalities(@Param('cityId') cityId: string) {
    return this.categoriesService.getLocalities(cityId);
  }
}
