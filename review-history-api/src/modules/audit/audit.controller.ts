import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';

@ApiTags('Audit')
@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'List audit logs (admin)' })
  list(@Query() query: ListAuditLogsDto) {
    return this.auditService.listLogs(query.page, query.pageSize, {
      action: query.action,
      objectType: query.objectType,
      actorUserId: query.actorUserId,
    });
  }
}
