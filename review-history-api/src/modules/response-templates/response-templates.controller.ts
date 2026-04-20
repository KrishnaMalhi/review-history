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

class CreateTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  titleUr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bodyEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bodyUr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sentiment!: string;

  // Backward compatibility for stale admin bundle keys.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
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
  @MaxLength(200)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  titleUr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bodyEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bodyUr?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
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
