import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
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
import { MailerModule } from './common/mailer/mailer.module';
import { UploadModule } from './modules/upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

// Platform expansion modules
import { EmployerProfilesModule } from './modules/employer-profiles/employer-profiles.module';
import { ResponseMetricsModule } from './modules/response-metrics/response-metrics.module';
import { BadgesModule } from './modules/badges/badges.module';
import { ReviewInvitesModule } from './modules/review-invites/review-invites.module';
import { FollowsModule } from './modules/follows/follows.module';
import { IssueResolutionsModule } from './modules/issue-resolutions/issue-resolutions.module';
import { CategoryExtensionsModule } from './modules/category-extensions/category-extensions.module';
import { CommunityValidationsModule } from './modules/community-validations/community-validations.module';
import { ReviewQualityModule } from './modules/review-quality/review-quality.module';
import { ReviewStreaksModule } from './modules/review-streaks/review-streaks.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ResponseTemplatesModule } from './modules/response-templates/response-templates.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { DiscussionsModule } from './modules/discussions/discussions.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

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
    MailerModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),

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

    // Platform expansion modules
    EmployerProfilesModule,
    ResponseMetricsModule,
    BadgesModule,
    ReviewInvitesModule,
    FollowsModule,
    IssueResolutionsModule,
    CategoryExtensionsModule,
    CommunityValidationsModule,
    ReviewQualityModule,
    ReviewStreaksModule,
    CampaignsModule,
    AnalyticsModule,
    ResponseTemplatesModule,
    OnboardingModule,
    BlogsModule,
    DiscussionsModule,
    RealtimeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
