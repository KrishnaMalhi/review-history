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
import { CampaignsService } from './campaigns.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsDateString, IsInt, Min, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '../../common/constants/field-limits';

class CreateCampaignDto {
  @IsString()
  @MaxLength(FIELD_LIMITS.CAMPAIGN_TITLE)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  categoryKey?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetGoal?: number;
}

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateCampaignDto) {
    return this.service.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Public()
  @Get()
  async list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.list(
      status as any,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getById(id);
  }

  @Roles('admin')
  @Patch(':id/activate')
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.activate(id);
  }

  @Roles('admin')
  @Patch(':id/complete')
  async complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.complete(id);
  }

  @Post(':id/join')
  async join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.service.join(id, user.sub);
  }

  @Public()
  @Get(':id/leaderboard')
  async leaderboard(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getLeaderboard(id, limit ? parseInt(limit, 10) : 20);
  }
}
