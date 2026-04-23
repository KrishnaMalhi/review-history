import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobsProcessor } from './jobs.processor';
import { JobsService } from './jobs.service';
import { SYSTEM_QUEUE } from './jobs.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: Number(config.get<string>('REDIS_PORT', '6379')),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BullModule.registerQueue({
      name: SYSTEM_QUEUE,
    }),
  ],
  providers: [JobsProcessor, JobsService],
  exports: [JobsService, BullModule],
})
export class JobsModule {}
