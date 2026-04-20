import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('saved-entities')
  @ApiOperation({ summary: 'Get my saved entities' })
  getSavedEntities(@CurrentUser() user: JwtPayload) {
    return this.usersService.getSavedEntities(user.sub);
  }

  @Post('saved-entities/:entityId')
  @ApiOperation({ summary: 'Save an entity' })
  saveEntity(@CurrentUser() user: JwtPayload, @Param('entityId') entityId: string) {
    return this.usersService.saveEntity(user.sub, entityId);
  }

  @Delete('saved-entities/:entityId')
  @ApiOperation({ summary: 'Unsave an entity' })
  unsaveEntity(@CurrentUser() user: JwtPayload, @Param('entityId') entityId: string) {
    return this.usersService.unsaveEntity(user.sub, entityId);
  }
}
