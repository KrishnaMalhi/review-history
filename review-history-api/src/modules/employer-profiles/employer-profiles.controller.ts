import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployerProfilesService } from './employer-profiles.service';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EntityOwnerGuard } from '../../common/guards/entity-owner.guard';

@ApiTags('Employer Profiles')
@Controller()
export class EmployerProfilesController {
  constructor(private readonly service: EmployerProfilesService) {}

  @Public()
  @Get('entities/:entityId/employer-profile')
  async findByEntity(@Param('entityId') entityId: string) {
    return this.service.findByEntity(entityId);
  }

  @ApiBearerAuth()
  @UseGuards(EntityOwnerGuard)
  @Post('entities/:entityId/employer-profile')
  async create(
    @Param('entityId') entityId: string,
    @Body() dto: CreateEmployerProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(entityId, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(EntityOwnerGuard)
  @Patch('entities/:entityId/employer-profile')
  async update(
    @Param('entityId') entityId: string,
    @Body() dto: UpdateEmployerProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(entityId, dto, user.sub);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('admin/entities/:entityId/verify-employer')
  async verifyEmployer(
    @Param('entityId') entityId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.verifyEmployer(entityId, 'admin_verification', user.sub);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Get('admin/employer-profiles')
  async listAll(@Query() query: PaginationDto) {
    return this.service.listAll(query.page, query.pageSize);
  }
}
