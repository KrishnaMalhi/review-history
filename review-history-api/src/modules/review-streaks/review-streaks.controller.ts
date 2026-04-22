import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ReviewStreaksService } from './review-streaks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { TrackActivityDto } from './dto/track-activity.dto';

@Controller('review-streaks')
export class ReviewStreaksController {
  constructor(private readonly service: ReviewStreaksService) {}

  @Get('me')
  async getMyStreak(@CurrentUser() user: any) {
    return this.service.getUserStreak(user.sub);
  }

  @Post('activities')
  async trackMyActivity(@CurrentUser() user: any, @Body() dto: TrackActivityDto) {
    await this.service.recordActivity(user.sub, dto.activityType, dto.minutes ?? 0);
    return { tracked: true };
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
