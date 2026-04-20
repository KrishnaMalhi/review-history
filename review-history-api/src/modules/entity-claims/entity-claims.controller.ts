import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EntityClaimsService } from './entity-claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Entity Claims')
@Controller()
export class EntityClaimsController {
  constructor(private readonly claimsService: EntityClaimsService) {}

  @Post('entities/:entityId/claims')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an ownership claim for an entity' })
  create(
    @Param('entityId') entityId: string,
    @Body() dto: CreateClaimDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.claimsService.createClaim(entityId, dto, user.sub);
  }

  @Patch('admin/claims/:claimId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject an entity claim (admin)' })
  review(
    @Param('claimId') claimId: string,
    @Body() dto: ReviewClaimDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.claimsService.reviewClaim(claimId, dto, user.sub);
  }

  @Get('admin/claims')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending claims (admin)' })
  listPending(@Query() query: PaginationDto) {
    return this.claimsService.listPendingClaims(query.page, query.pageSize);
  }

  @Get('me/claims')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my entity claims' })
  getMyClaims(@CurrentUser() user: JwtPayload) {
    return this.claimsService.getUserClaims(user.sub);
  }
}
