import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  BadRequestException,
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
  @MaxLength(FIELD_LIMITS.CAMPAIGN_DESCRIPTION)
  description?: string;

  @IsOptional()
  @IsString()
  categoryKey?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

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
    const startDateValue = dto.startDate ?? dto.startsAt;
    const endDateValue = dto.endDate ?? dto.endsAt;

    if (!startDateValue || !endDateValue) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return this.service.create({
      ...dto,
      startDate: new Date(startDateValue),
      endDate: new Date(endDateValue),
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
