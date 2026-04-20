import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { ListBlogsDto } from './dto/list-blogs.dto';
import { Public, CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

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

  @Get('admin/blogs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all blogs' })
  listAdmin(@Query() query: ListBlogsDto) {
    return this.blogsService.listAdmin(query);
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
}
