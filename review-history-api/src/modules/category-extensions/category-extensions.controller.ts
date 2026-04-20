import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryExtensionsService } from './category-extensions.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSchoolProfileDto, CreateMedicalProfileDto, CreateProductProfileDto } from './dto/create-category-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('category-extensions')
export class CategoryExtensionsController {
  constructor(private readonly service: CategoryExtensionsService) {}

  // ─── Profile endpoints ────────────────────────

  @Public()
  @Get('entities/:entityId/profile')
  async getProfile(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.service.getProfile(entityId);
  }

  @Roles('claimed_owner')
  @Post('entities/:entityId/school-profile')
  async createSchoolProfile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: CreateSchoolProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createProfile(entityId, dto, user.sub);
  }

  @Roles('claimed_owner')
  @Patch('entities/:entityId/school-profile')
  async updateSchoolProfile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: Partial<CreateSchoolProfileDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.updateProfile(entityId, dto, user.sub);
  }

  @Roles('claimed_owner')
  @Post('entities/:entityId/medical-profile')
  async createMedicalProfile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: CreateMedicalProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createProfile(entityId, dto, user.sub);
  }

  @Roles('claimed_owner')
  @Patch('entities/:entityId/medical-profile')
  async updateMedicalProfile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: Partial<CreateMedicalProfileDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.updateProfile(entityId, dto, user.sub);
  }

  @Roles('claimed_owner')
  @Post('entities/:entityId/product-profile')
  async createProductProfile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: CreateProductProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createProfile(entityId, dto, user.sub);
  }

  @Roles('claimed_owner')
  @Patch('entities/:entityId/product-profile')
  async updateProductProfile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: Partial<CreateProductProfileDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.updateProfile(entityId, dto, user.sub);
  }

  // ─── Review data endpoint (read) ─────────────

  @Public()
  @Get('reviews/:reviewId/extension-data/:categoryKey')
  async getReviewData(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('categoryKey') categoryKey: string,
  ) {
    return this.service.getReviewData(reviewId, categoryKey);
  }

  // ─── Admin listing endpoints ──────────────────

  @Roles('admin')
  @Get('admin/school-profiles')
  async listSchoolProfiles(@Query() query: PaginationDto) {
    return this.service.listSchoolProfiles(query.page, query.pageSize);
  }

  @Roles('admin')
  @Get('admin/medical-profiles')
  async listMedicalProfiles(@Query() query: PaginationDto) {
    return this.service.listMedicalProfiles(query.page, query.pageSize);
  }

  @Roles('admin')
  @Get('admin/product-profiles')
  async listProductProfiles(@Query() query: PaginationDto) {
    return this.service.listProductProfiles(query.page, query.pageSize);
  }
}
