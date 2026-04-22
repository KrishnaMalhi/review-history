import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ResponseTemplatesService } from './response-templates.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsString, IsOptional, MaxLength, IsBoolean, IsInt, Min } from 'class-validator';
import { FIELD_LIMITS } from '../../common/constants/field-limits';

class CreateTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_TITLE)
  titleEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_TITLE_UR)
  titleUr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_BODY)
  bodyEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_BODY)
  bodyUr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SENTIMENT)
  sentiment!: string;

  // Backward compatibility for stale admin bundle keys.
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_TITLE)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_BODY)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SENTIMENT)
  tone?: string;

  @IsOptional()
  @IsString()
  categoryKey?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_TITLE)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_TITLE_UR)
  titleUr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_BODY)
  bodyEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.TEMPLATE_BODY)
  bodyUr?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.SENTIMENT)
  sentiment?: string;

  @IsOptional()
  @IsString()
  categoryKey?: string;
}

@Controller('response-templates')
export class ResponseTemplatesController {
  constructor(private readonly service: ResponseTemplatesService) {}

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateTemplateDto) {
    const normalized = {
      titleEn: dto.titleEn ?? dto.name,
      titleUr: dto.titleUr,
      bodyEn: dto.bodyEn ?? dto.body,
      bodyUr: dto.bodyUr,
      sentiment: dto.sentiment ?? dto.tone,
      categoryKey: dto.categoryKey,
      sortOrder: dto.sortOrder,
    };

    if (!normalized.titleEn || !normalized.bodyEn || !normalized.sentiment) {
      throw new BadRequestException('titleEn, bodyEn and sentiment are required');
    }

    return this.service.create(normalized);
  }

  @Public()
  @Get()
  async list(
    @Query('categoryKey') categoryKey?: string,
    @Query('sentiment') sentiment?: string,
  ) {
    return this.service.list(categoryKey, sentiment);
  }

  @Roles('admin')
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getById(id);
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
