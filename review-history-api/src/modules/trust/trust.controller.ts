import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrustService } from './trust.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';

@ApiTags('Trust')
@Controller()
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  @Public()
  @Get('entities/:entityId/trust')
  @ApiOperation({ summary: 'Get entity trust summary' })
  getEntityTrust(@Param('entityId') entityId: string) {
    return this.trustService.getEntityTrustSummary(entityId);
  }

  @Post('admin/trust/recalculate/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recalculate user trust score (admin)' })
  recalculate(@Param('userId') userId: string) {
    return this.trustService.recalculateUserTrust(userId);
  }

  @Get('admin/trust/:userId/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get entity trust event history (admin)' })
  getHistory(@Param('userId') entityId: string) {
    return this.trustService.getEntityTrustHistory(entityId);
  }
}
