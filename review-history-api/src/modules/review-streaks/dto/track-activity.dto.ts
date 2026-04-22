import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class TrackActivityDto {
  @ApiProperty({
    enum: [
      'feed_visit',
      'discussion_visit',
      'community_visit',
      'active_time',
      'add_listing',
      'add_review',
      'like_or_vote',
      'share',
      'follow',
      'discussion_post',
      'discussion_comment',
      'community_validation',
    ],
  })
  @IsIn([
    'feed_visit',
    'discussion_visit',
    'community_visit',
    'active_time',
    'add_listing',
    'add_review',
    'like_or_vote',
    'share',
    'follow',
    'discussion_post',
    'discussion_comment',
    'community_validation',
  ])
  activityType!:
    | 'feed_visit'
    | 'discussion_visit'
    | 'community_visit'
    | 'active_time'
    | 'add_listing'
    | 'add_review'
    | 'like_or_vote'
    | 'share'
    | 'follow'
    | 'discussion_post'
    | 'discussion_comment'
    | 'community_validation';

  @ApiProperty({ required: false, minimum: 1, maximum: 120 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  minutes?: number;
}
