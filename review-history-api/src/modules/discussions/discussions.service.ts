import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ListDiscussionsDto } from './dto/list-discussions.dto';
import { CursorPaginatedResponse } from '../../common/dto/pagination.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { CreateDiscussionCommentDto } from './dto/create-discussion-comment.dto';
import { ReactDiscussionDto } from './dto/react-discussion.dto';
import { DiscussionReactionType, Prisma } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { ReviewStreaksService } from '../review-streaks/review-streaks.service';

@Injectable()
export class DiscussionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly realtime?: RealtimeGateway,
    private readonly reviewStreaks?: ReviewStreaksService,
  ) {}

  async list(query: ListDiscussionsDto, currentUserId?: string) {
    const limit = query.limit || query.pageSize || 20;
    const cursorId = query.cursor;
    const q = query.q?.trim();

    const where: Prisma.DiscussionPostWhereInput = {
      deletedAt: null,
      status: 'published',
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { body: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const cursorPost = cursorId
      ? await this.prisma.discussionPost.findUnique({
          where: { id: cursorId },
          select: { id: true, createdAt: true },
        })
      : null;

    const whereWithCursor: Prisma.DiscussionPostWhereInput = cursorPost
      ? {
          AND: [
            where,
            {
              OR: [
                { createdAt: { lt: cursorPost.createdAt } },
                { createdAt: cursorPost.createdAt, id: { lt: cursorPost.id } },
              ],
            },
          ],
        }
      : where;

    const [rows, total] = await Promise.all([
      this.prisma.discussionPost.findMany({
        where: whereWithCursor,
        take: limit + 1,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          author: { select: { id: true, displayName: true } },
          comments: {
            where: { deletedAt: null },
            take: 3,
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, displayName: true } } },
          },
          ...(currentUserId
            ? {
                reactions: {
                  where: { userId: currentUserId },
                  select: { type: true },
                  take: 1,
                },
              }
            : {}),
        },
      }),
      this.prisma.discussionPost.count({ where }),
    ]);

    const hasNext = rows.length > limit;
    const pageRows = hasNext ? rows.slice(0, limit) : rows;

    const items = pageRows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      isAnonymous: row.isAnonymous,
      createdAt: row.createdAt,
      likeCount: row.likeCount,
      dislikeCount: row.dislikeCount,
      commentCount: row.commentCount,
      author: row.isAnonymous
        ? { id: null, displayName: 'Anonymous' }
        : { id: row.author.id, displayName: row.author.displayName || 'User' },
      userReaction: currentUserId ? row.reactions?.[0]?.type || null : null,
      comments: row.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        isAnonymous: comment.isAnonymous,
        createdAt: comment.createdAt,
        author: comment.isAnonymous
          ? { id: null, displayName: 'Anonymous' }
          : { id: comment.author.id, displayName: comment.author.displayName || 'User' },
      })),
    }));

    const nextCursor = hasNext ? pageRows[pageRows.length - 1]?.id ?? null : null;
    return new CursorPaginatedResponse(items, nextCursor, total);
  }

  async create(dto: CreateDiscussionDto, userId: string) {
    const row = await this.prisma.discussionPost.create({
      data: {
        authorUserId: userId,
        title: dto.title ? sanitizeInput(dto.title) : null,
        body: sanitizeInput(dto.body),
        isAnonymous: dto.isAnonymous ?? false,
      },
    });

    await this.reviewStreaks?.recordActivity(userId, 'discussion_post');

    return { id: row.id, createdAt: row.createdAt };
  }

  async react(discussionId: string, dto: ReactDiscussionDto, userId: string) {
    const discussion = await this.prisma.discussionPost.findFirst({
      where: { id: discussionId, deletedAt: null, status: 'published' },
      select: { id: true },
    });
    if (!discussion) throw new NotFoundException('Discussion not found');

    const existing = await this.prisma.discussionReaction.findUnique({
      where: { discussionId_userId: { discussionId, userId } },
    });

    if (existing?.type === dto.type) {
      await this.prisma.discussionReaction.delete({
        where: { discussionId_userId: { discussionId, userId } },
      });
    } else if (existing) {
      await this.prisma.discussionReaction.update({
        where: { discussionId_userId: { discussionId, userId } },
        data: { type: dto.type as DiscussionReactionType },
      });
    } else {
      await this.prisma.discussionReaction.create({
        data: {
          discussionId,
          userId,
          type: dto.type as DiscussionReactionType,
        },
      });
    }

    const [likeCount, dislikeCount, userReaction] = await Promise.all([
      this.prisma.discussionReaction.count({ where: { discussionId, type: 'like' } }),
      this.prisma.discussionReaction.count({ where: { discussionId, type: 'dislike' } }),
      this.prisma.discussionReaction.findUnique({
        where: { discussionId_userId: { discussionId, userId } },
        select: { type: true },
      }),
    ]);

    await this.prisma.discussionPost.update({
      where: { id: discussionId },
      data: { likeCount, dislikeCount },
    });

    if (!existing || existing.type !== dto.type) {
      await this.reviewStreaks?.recordActivity(userId, 'like_or_vote');
    }

    // Emit real-time reaction update
    this.realtime?.emitDiscussionReaction(discussionId, likeCount, dislikeCount);

    return {
      discussionId,
      likeCount,
      dislikeCount,
      userReaction: userReaction?.type || null,
    };
  }

  async addComment(discussionId: string, dto: CreateDiscussionCommentDto, userId: string) {
    const discussion = await this.prisma.discussionPost.findFirst({
      where: { id: discussionId, deletedAt: null, status: 'published' },
      select: { id: true },
    });
    if (!discussion) throw new NotFoundException('Discussion not found');

    const comment = await this.prisma.discussionComment.create({
      data: {
        discussionId,
        authorUserId: userId,
        body: sanitizeInput(dto.body),
        isAnonymous: dto.isAnonymous ?? false,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });

    const commentCount = await this.prisma.discussionComment.count({
      where: { discussionId, deletedAt: null },
    });

    await this.prisma.discussionPost.update({
      where: { id: discussionId },
      data: { commentCount },
    });

    await this.reviewStreaks?.recordActivity(userId, 'discussion_comment');

    const result = {
      id: comment.id,
      body: comment.body,
      isAnonymous: comment.isAnonymous,
      createdAt: comment.createdAt,
      author: comment.isAnonymous
        ? { id: null, displayName: 'Anonymous' }
        : { id: comment.author.id, displayName: comment.author.displayName || 'User' },
    };

    // Emit real-time new comment
    this.realtime?.emitDiscussionComment(discussionId, result);

    return result;
  }
}
