import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommunityValidationsService } from './community-validations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsEnum } from 'class-validator';
import { CommunityValidationType } from '@prisma/client';

class CreateValidationDto {
  @IsEnum(CommunityValidationType)
  validationType!: CommunityValidationType;
}

@Controller('reviews/:reviewId/validations')
export class CommunityValidationsController {
  constructor(private readonly service: CommunityValidationsService) {}

  @Post()
  async validate(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateValidationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.validate(reviewId, user.sub, dto.validationType);
  }

  @Delete()
  async removeValidation(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.removeValidation(reviewId, user.sub);
  }

  @Public()
  @Get()
  async getByReview(@Param('reviewId', ParseUUIDPipe) reviewId: string) {
    return this.service.getByReview(reviewId);
  }
}
