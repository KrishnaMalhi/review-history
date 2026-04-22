import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { ListBlogsDto } from './dto/list-blogs.dto';
import { Public, CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';

@ApiTags('Blogs')
@Controller()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Public()
  @Get('blogs')
  @ApiOperation({ summary: 'Public list of published blogs' })
  listPublic(@Query() query: ListBlogsDto) {
    return this.blogsService.listPublic(query);
  }

  @Public()
  @Get('blogs/:slug')
  @ApiOperation({ summary: 'Public blog detail by slug' })
  getPublic(@Param('slug') slug: string) {
    return this.blogsService.getPublicBySlug(slug);
  }

  @Public()
  @Get('blog-categories')
  @ApiOperation({ summary: 'Public list of blog categories' })
  listPublicCategories() {
    return this.blogsService.listPublicCategories();
  }

  @Public()
  @Get('blog-tags')
  @ApiOperation({ summary: 'Public list of blog tags' })
  listPublicTags() {
    return this.blogsService.listPublicTags();
  }

  @Get('admin/blogs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all blogs' })
  listAdmin(@Query() query: ListBlogsDto) {
    return this.blogsService.listAdmin(query);
  }

  @Get('admin/blogs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get blog by id' })
  getAdminById(@Param('id') id: string) {
    return this.blogsService.getAdminById(id);
  }

  @Post('admin/blogs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin create blog' })
  create(@Body() dto: CreateBlogDto, @CurrentUser() user: JwtPayload) {
    return this.blogsService.create(dto, user.sub);
  }

  @Patch('admin/blogs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update blog' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete('admin/blogs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete blog' })
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  @Get('admin/blog-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list blog categories' })
  listAdminCategories() {
    return this.blogsService.listAdminCategories();
  }

  @Post('admin/blog-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin create blog category' })
  createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogsService.createCategory(dto);
  }

  @Patch('admin/blog-categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update blog category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
    return this.blogsService.updateCategory(id, dto);
  }

  @Delete('admin/blog-categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete blog category' })
  deleteCategory(@Param('id') id: string) {
    return this.blogsService.deleteCategory(id);
  }

  @Get('admin/blog-tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list blog tags' })
  listAdminTags() {
    return this.blogsService.listAdminTags();
  }

  @Post('admin/blog-tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin create blog tag' })
  createTag(@Body() dto: CreateBlogTagDto) {
    return this.blogsService.createTag(dto);
  }

  @Patch('admin/blog-tags/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update blog tag' })
  updateTag(@Param('id') id: string, @Body() dto: UpdateBlogTagDto) {
    return this.blogsService.updateTag(id, dto);
  }

  @Delete('admin/blog-tags/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete blog tag' })
  deleteTag(@Param('id') id: string) {
    return this.blogsService.deleteTag(id);
  }
}
