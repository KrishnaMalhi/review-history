# Claude Prompt And Implementation

Last updated: 2026-04-23

## Scope
This document tracks implementation progress for the "ReviewHistory — Master Implementation Prompt (All Phases)" against the current backend state in `review-history-api`.

## Implemented in this pass
- Cursor pagination migration (core listing endpoints now return `{ data, nextCursor, total }`):
  - `GET /entities/:entityId/reviews`
  - `GET /reviews/feed`
  - `GET /reviews/feed/me`
  - `GET /discussions`
  - `GET /discussions/me`
  - `GET /blogs`
  - `GET /admin/blogs`
  - `GET /search/entities`
  - Related files:
    - `src/common/dto/pagination.dto.ts` (added `cursor` + `CursorPaginatedResponse`)
    - `reviews.service.ts`, `discussions.service.ts`, `blogs.service.ts`, `search.service.ts`
- Feed ranking enhancement:
  - Added `sort=recommended|recent|top` in review feed DTO
  - Implemented composite recommended feed scoring using:
    - recency
    - review quality score
    - entity trust score
    - helpful ratio
    - verified/replied response bonus
    - follow bonus (authenticated user)
  - File: `src/modules/reviews/reviews.service.ts`
- Search ranking enhancement:
  - Added `sort=recommended` default in search DTO
  - Implemented composite search score using text relevance, rating, trust, response rate, volume, verification bonus
  - Files:
    - `src/modules/search/dto/search-entities.dto.ts`
    - `src/modules/search/search.service.ts`
- Notification type expansion + compatibility:
  - Expanded Prisma enum `NotificationType` with new types in `prisma/schema.prisma`
  - Added migration:
    - `prisma/migrations/20260423112000_expand_notification_types/migration.sql`
  - Added `NotificationsService.send()` compatibility method
  - File: `src/modules/notifications/notifications.service.ts`
- Notification triggers added/updated:
  - `reply_received` from replies
  - `issue_resolved_by_owner`, `issue_confirmed`, `issue_disputed` from issue resolutions
  - `badge_awarded` from badge grants (first award only)
  - `helpful_milestone` at 10/25/50 helpful votes
  - `employer_verified` on employer verification
  - `claim_approved` / `claim_rejected` on claim review outcomes
  - Files touched:
    - `replies.service.ts`, `issue-resolutions.service.ts`, `badges.service.ts`,
      `votes.service.ts`, `employer-profiles.service.ts`, `entity-claims.service.ts`
  - Module imports updated for notifications dependencies:
    - `replies.module.ts`, `votes.module.ts`, `badges.module.ts`,
      `employer-profiles.module.ts`, `entity-claims.module.ts`

## Previous implemented items (earlier pass)
- Added BullMQ job infrastructure:
  - `review-history-api/src/modules/jobs/jobs.module.ts`
  - `review-history-api/src/modules/jobs/jobs.service.ts`
  - `review-history-api/src/modules/jobs/jobs.processor.ts`
  - `review-history-api/src/modules/jobs/jobs.constants.ts`
  - Registered in `review-history-api/src/app.module.ts`
- Registered repeat/scheduled jobs:
  - `expire-invites` (hourly)
  - `recalculate-response-metrics` (daily at 00:05 PKT)
  - `weekly-digest` (Monday 09:00 PKT)
- Added job handlers for:
  - `recalculate-response-metrics`
  - `evaluate-badges`
  - `recalculate-quality-score`
  - `expire-invites`
- Switched heavy post-review operations to queue enqueue:
  - `reviews.service.ts` now enqueues metrics/badges/quality jobs
- Added queue triggers from:
  - `replies.service.ts` (metrics + badges after owner reply)
  - `votes.service.ts` (quality score recalc after vote add/remove)
  - `issue-resolutions.service.ts` (metrics + badges on confirm)
- Issue resolution route alignment:
  - Added `POST /reviews/:reviewId/dispute-resolved`
  - Kept legacy `POST /reviews/:reviewId/dispute-resolution`
  - Added public `GET /reviews/:reviewId/resolution`
- Added owner notifications on issue confirm/dispute (currently via existing `moderation_action` type payload event keys).

## Previous implemented items (earlier pass)
- Added shared category constants:
  - `review-history-api/src/common/constants/category-keys.ts`
  - `WORKPLACE_CATEGORY_KEYS`, `SCHOOL_CATEGORY_KEYS`, `MEDICAL_CATEGORY_KEYS`, `PRODUCT_CATEGORY_KEYS`
- Added shared owner guard:
  - `review-history-api/src/common/guards/entity-owner.guard.ts`
  - Exported from `review-history-api/src/common/guards/index.ts`
  - Applied on owner routes in:
    - `employer-profiles.controller.ts`
    - `review-invites.controller.ts`
- Added shared PKT and IP utilities:
  - `review-history-api/src/common/utils/date.util.ts`
  - `review-history-api/src/common/utils/ip.util.ts`
- Normalized category checks to shared constants:
  - `category-extensions.service.ts`
  - `entity-claims.service.ts`
- Extended review create DTO for prompt-aligned inputs:
  - Added `inviteToken` (64 hex chars)
  - Added typed vertical payloads: `workplace`, `school`, `medical`, `product`
  - File: `review-history-api/src/modules/reviews/dto/create-review.dto.ts`
- Extended review creation behavior:
  - Block owner reviewing own claimed entity
  - Increased review rate limit to `10/day`
  - Added medical flag pattern auto-escalation to `under_verification`
  - Accept vertical payloads and persist via category extension handler
  - Mark invite conversion when review is published and `inviteToken` is provided
  - Files:
    - `review-history-api/src/modules/reviews/reviews.service.ts`
    - `review-history-api/src/modules/reviews/reviews.module.ts`
- Updated invites behavior:
  - Resolve endpoint now logs hashed IP with analytics event
  - Active invite cap violation now returns 422 (`UnprocessableEntityException`)
  - Conversion now expires invite when `useCount >= maxUses`
  - Files:
    - `review-history-api/src/modules/review-invites/review-invites.service.ts`
    - `review-history-api/src/modules/review-invites/review-invites.controller.ts`
- Added analytics event endpoint with throttle and hashed IP storage:
  - `POST /analytics/event` throttled at `10/min/IP`
  - Fire-and-forget event logging via `AnalyticsService.logEvent()`
  - Files:
    - `review-history-api/src/modules/analytics/dto/log-analytics-event.dto.ts`
    - `review-history-api/src/modules/analytics/analytics.controller.ts`
    - `review-history-api/src/modules/analytics/analytics.service.ts`
- Enforced sensitive-field stripping in category profile read APIs:
  - `pmdcNumber` stripped from medical public profile response
  - `barcode` stripped from product public profile response
  - File: `review-history-api/src/modules/category-extensions/category-extensions.service.ts`
- Updated employer profile completion scoring to weighted formula from prompt:
  - File: `review-history-api/src/modules/employer-profiles/employer-profiles.service.ts`

## High-priority remaining gaps
- Full cursor pagination migration (`?cursor=&limit=`) is not yet complete across existing list APIs.
- BullMQ job registry and processors for:
  - `recalculate-response-metrics`
  - `evaluate-badges`
  - `recalculate-quality-score`
  - `expire-invites`
  - `weekly-digest`
  - `ai-review-summary`
- AuditService/NotificationsService prompt contract alignment:
  - standardize to `AuditService.log()`
  - standardize to `NotificationsService.send()`
- Full route parity for all Phase 2/3 endpoints (feed/search composite ranking, compare, meta, AI assist, review summary, salary benchmark, localization middleware).
- Dedicated vertical profile modules (`school-profiles`, `medical-profiles`, `product-profiles`) still rely partly on shared category-extension module patterns.
- Test coverage required by checklist (unit + integration lifecycle) not yet added in this pass.

## Notes
- Existing project already had substantial portions of Phase 1 models/modules implemented; this pass focused on missing shared foundations and behavior mismatches with the master prompt.
