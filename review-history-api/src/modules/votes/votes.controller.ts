import { Controller, Post, Get, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload, Public } from '../../common/decorators';
import { CastVoteDto } from './dto/cast-vote.dto';

@ApiTags('Votes')
@Controller('reviews/:reviewId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a review (helpful/not_helpful/fake)' })
  vote(
    @Param('reviewId') reviewId: string,
    @Body() dto: CastVoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.vote(reviewId, user.sub, dto.voteType);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get vote summary for a review' })
  getSummary(@Param('reviewId') reviewId: string) {
    return this.votesService.getVoteSummary(reviewId);
  }
}
