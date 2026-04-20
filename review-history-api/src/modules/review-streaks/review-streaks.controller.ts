import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ReviewStreaksService } from './review-streaks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('review-streaks')
export class ReviewStreaksController {
  constructor(private readonly service: ReviewStreaksService) {}

  @Get('me')
  async getMyStreak(@CurrentUser() user: any) {
    return this.service.getUserStreak(user.sub);
  }

  @Public()
  @Get('users/:userId')
  async getUserStreak(@Param('userId', ParseUUIDPipe) userId: string) {
    const streak = await this.service.getUserStreak(userId);
    // Only expose public-safe fields
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
    };
  }

  @Public()
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.service.getLeaderboard(limit ? parseInt(limit, 10) : 20);
  }
}
