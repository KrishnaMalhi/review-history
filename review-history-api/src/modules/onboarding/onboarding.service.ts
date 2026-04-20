import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    const prefs = await this.prisma.onboardingPreference.findUnique({
      where: { userId },
    });
    if (!prefs) return null;
    return {
      ...prefs,
      categoryKeys: prefs.categoryKeysJson || [],
    };
  }

  async setPreferences(
    userId: string,
    data: {
      categoryKeys?: string[];
      selectedCityId?: string;
      languageCode?: string;
    },
  ) {
    return this.prisma.onboardingPreference.upsert({
      where: { userId },
      create: {
        userId,
        categoryKeysJson: data.categoryKeys || [],
        selectedCityId: data.selectedCityId || null,
        isComplete: true,
      },
      update: {
        ...(data.categoryKeys !== undefined && {
          categoryKeysJson: data.categoryKeys,
        }),
        ...(data.selectedCityId !== undefined && {
          selectedCityId: data.selectedCityId,
        }),
        isComplete: true,
      },
    });
  }

  async isOnboarded(userId: string): Promise<boolean> {
    const prefs = await this.prisma.onboardingPreference.findUnique({
      where: { userId },
      select: { isComplete: true },
    });
    return !!prefs?.isComplete;
  }
}
