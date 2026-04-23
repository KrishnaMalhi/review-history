import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';
import { ReviewQualityService } from '../review-quality/review-quality.service';
import { ResponseMetricsService } from '../response-metrics/response-metrics.service';
import {
  JOB_EVALUATE_BADGES,
  JOB_EXPIRE_INVITES,
  JOB_RECALCULATE_QUALITY_SCORE,
  JOB_RECALCULATE_RESPONSE_METRICS,
  JOB_WEEKLY_DIGEST,
  SYSTEM_QUEUE,
} from './jobs.constants';

@Injectable()
@Processor(SYSTEM_QUEUE)
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case JOB_RECALCULATE_RESPONSE_METRICS:
        return this.handleRecalculateResponseMetrics(job.data);
      case JOB_EVALUATE_BADGES:
        return this.handleEvaluateBadges(job.data);
      case JOB_RECALCULATE_QUALITY_SCORE:
        return this.handleRecalculateQualityScore(job.data);
      case JOB_EXPIRE_INVITES:
        return this.handleExpireInvites();
      case JOB_WEEKLY_DIGEST:
        return this.handleWeeklyDigest();
      default:
        this.logger.warn(`Unhandled job: ${job.name}`);
        return null;
    }
  }

  private async handleRecalculateResponseMetrics(data: { entityId?: string; all?: boolean }) {
    const responseMetrics = this.moduleRef.get(ResponseMetricsService, { strict: false });
    const badges = this.moduleRef.get(BadgesService, { strict: false });

    if (!responseMetrics) {
      this.logger.warn('ResponseMetricsService unavailable for job');
      return { skipped: true };
    }

    if (data?.entityId) {
      await responseMetrics.recalculate(data.entityId);
      if (badges) {
        await badges.evaluateEntityBadges(data.entityId);
      }
      return { processed: 1 };
    }

    if (!data?.all) {
      return { processed: 0 };
    }

    const entities = await this.prisma.entity.findMany({
      where: { deletedAt: null },
      select: { id: true },
      take: 5000,
    });

    for (const entity of entities) {
      await responseMetrics.recalculate(entity.id);
      if (badges) {
        await badges.evaluateEntityBadges(entity.id);
      }
    }

    return { processed: entities.length };
  }

  private async handleEvaluateBadges(data: { entityId?: string; userId?: string }) {
    const badges = this.moduleRef.get(BadgesService, { strict: false });
    if (!badges) {
      this.logger.warn('BadgesService unavailable for job');
      return { skipped: true };
    }

    if (data?.entityId) {
      await badges.evaluateEntityBadges(data.entityId);
    }
    if (data?.userId) {
      await badges.evaluateUserBadges(data.userId);
    }
    return { done: true };
  }

  private async handleRecalculateQualityScore(data: { reviewId: string }) {
    if (!data?.reviewId) {
      return { skipped: true };
    }

    const quality = this.moduleRef.get(ReviewQualityService, { strict: false });
    if (!quality) {
      this.logger.warn('ReviewQualityService unavailable for job');
      return { skipped: true };
    }

    await quality.calculateScore(data.reviewId);
    return { processed: 1 };
  }

  private async handleExpireInvites() {
    const result = await this.prisma.reviewInvite.updateMany({
      where: {
        status: 'active',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'expired' },
    });
    return { expired: result.count };
  }

  private async handleWeeklyDigest() {
    // Placeholder processing hook; full digest channeling is implemented separately.
    const owners = await this.prisma.entity.findMany({
      where: { claimedUserId: { not: null }, deletedAt: null },
      select: { claimedUserId: true },
      distinct: ['claimedUserId'],
      take: 1000,
    });
    return { owners: owners.length };
  }
}
