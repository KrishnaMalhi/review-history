import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload, Public, Roles } from '../../common/decorators';

@ApiTags('Entities')
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new entity' })
  create(@Body() dto: CreateEntityDto, @CurrentUser() user: JwtPayload) {
    return this.entitiesService.create(dto, user.sub);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get entity profile by ID' })
  findById(@Param('id') id: string) {
    return this.entitiesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update entity (claimed owner or admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEntityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.entitiesService.update(id, dto, user.sub, user.role);
  }
}
