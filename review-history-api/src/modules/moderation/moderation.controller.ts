import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { ResolveCaseDto } from './dto/resolve-case.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { ListModerationCasesDto } from './dto/list-moderation-cases.dto';

@ApiTags('Moderation')
@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin', 'super_admin')
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('cases')
  @ApiOperation({ summary: 'List moderation cases' })
  list(@Query() query: ListModerationCasesDto) {
    return this.moderationService.listCases(query.page, query.pageSize, query.status);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get moderation case details' })
  getCase(@Param('id') id: string) {
    return this.moderationService.getCase(id);
  }

  @Patch('cases/:id/resolve')
  @ApiOperation({ summary: 'Resolve a moderation case' })
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveCaseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.moderationService.resolveCase(id, dto, user.sub);
  }
}
