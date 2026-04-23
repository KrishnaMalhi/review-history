import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  JOB_EVALUATE_BADGES,
  JOB_EXPIRE_INVITES,
  JOB_RECALCULATE_QUALITY_SCORE,
  JOB_RECALCULATE_RESPONSE_METRICS,
  JOB_WEEKLY_DIGEST,
  SYSTEM_QUEUE,
} from './jobs.constants';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue(SYSTEM_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    await Promise.all([
      this.queue.upsertJobScheduler(
        JOB_EXPIRE_INVITES,
        { pattern: '0 * * * *' },
        {
          name: JOB_EXPIRE_INVITES,
          data: {},
          opts: { removeOnComplete: 50, removeOnFail: 100 },
        },
      ),
      this.queue.upsertJobScheduler(
        JOB_RECALCULATE_RESPONSE_METRICS,
        { pattern: '5 0 * * *', tz: 'Asia/Karachi' },
        {
          name: JOB_RECALCULATE_RESPONSE_METRICS,
          data: { all: true },
          opts: { removeOnComplete: 20, removeOnFail: 50 },
        },
      ),
      this.queue.upsertJobScheduler(
        JOB_WEEKLY_DIGEST,
        { pattern: '0 9 * * 1', tz: 'Asia/Karachi' },
        {
          name: JOB_WEEKLY_DIGEST,
          data: {},
          opts: { removeOnComplete: 10, removeOnFail: 25 },
        },
      ),
    ]);

    this.logger.log('BullMQ schedulers registered');
  }

  async enqueueRecalculateResponseMetrics(payload: { entityId?: string; all?: boolean }) {
    await this.queue.add(JOB_RECALCULATE_RESPONSE_METRICS, payload, {
      removeOnComplete: 100,
      removeOnFail: 100,
    });
  }

  async enqueueEvaluateBadges(payload: { entityId?: string; userId?: string }) {
    await this.queue.add(JOB_EVALUATE_BADGES, payload, {
      removeOnComplete: 100,
      removeOnFail: 100,
    });
  }

  async enqueueRecalculateQualityScore(payload: { reviewId: string }) {
    await this.queue.add(JOB_RECALCULATE_QUALITY_SCORE, payload, {
      removeOnComplete: 100,
      removeOnFail: 100,
    });
  }
}
