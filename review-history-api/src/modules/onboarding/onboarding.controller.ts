import { Controller, Get, Put, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsOptional, IsString, IsArray, ArrayMaxSize } from 'class-validator';

class SetPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  categoryKeys?: string[];

  @IsOptional()
  @IsString()
  selectedCityId?: string;
}

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Get('preferences')
  async getPreferences(@CurrentUser() user: any) {
    return this.service.getPreferences(user.sub);
  }

  @Put('preferences')
  async setPreferences(
    @Body() dto: SetPreferencesDto,
    @CurrentUser() user: any,
  ) {
    return this.service.setPreferences(user.sub, dto);
  }

  @Get('status')
  async isOnboarded(@CurrentUser() user: any) {
    const onboarded = await this.service.isOnboarded(user.sub);
    return { onboarded };
  }
}
