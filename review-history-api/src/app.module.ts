import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { VotesModule } from './modules/votes/votes.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RepliesModule } from './modules/replies/replies.module';
import { EntityClaimsModule } from './modules/entity-claims/entity-claims.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { TrustModule } from './modules/trust/trust.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          // Coerce env values to numbers to avoid string math issues in throttler internals.
          ttl: Number(config.get<string>('THROTTLE_TTL', '60000')),
          limit: Number(config.get<string>('THROTTLE_LIMIT', '60')),
        },
      ],
    }),

    // Infrastructure
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    EntitiesModule,
    ReviewsModule,
    VotesModule,
    ReportsModule,
    RepliesModule,
    EntityClaimsModule,
    ModerationModule,
    TrustModule,
    SearchModule,
    NotificationsModule,
    AuditModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
