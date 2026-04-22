# ReviewHistory Master System Documentation

Last Updated: April 21, 2026  
Document Type: Single-source platform master doc (product + engineering + execution status)

## 1. Executive Summary

ReviewHistory is a Pakistan-first, entity-first trust platform where users can discover, create, and review entities (landlords, employers, schools, medical providers, products, services) and make safer decisions through transparent community signals.

Core principle:
- Reviews belong to entities, not to owners.
- Owners can claim and respond; they cannot rewrite valid history.
- Trust is built via identity friction, moderation, risk controls, and explainable scoring.

This document consolidates:
- Product scope and requirements
- Live implementation (API/web/admin/db)
- Current schema and feature map
- Business flows
- What changed
- Current status and next priorities

## 2. Product Scope

### 2.1 In Scope

- Entity search and discovery
- Entity creation by community
- Reviews with ratings/tags/category-specific extension data
- Review voting, reporting, moderation, admin actions
- Entity claim flow and owner replies
- Trust score and trust history
- Notifications and audit logs
- Employer, school, medical, product extension profiles
- Blogs and discussions
- Campaigns, follows, badges, streaks, invites, quality scoring, onboarding

### 2.2 Out of Scope (for current stage)

- Fully mature billing/subscription lifecycle UX
- Final legal automation workflow (complaint portal depth)
- Full EN/UR i18n rollout across UI
- Advanced feed A/B ranking framework
- Deep salary transparency productization at scale

## 3. Architecture

### 3.1 Repositories / Apps

- `review-history-api`: NestJS + Prisma + PostgreSQL + Redis + JWT + Swagger
- `review-history-web`: Next.js App Router (port `5002`)
- `review-history-admin`: Next.js admin panel (port `5001`)
- API base: `http://localhost:5000/api/v1`

### 3.2 Design Pattern

Base + Extension model:
- Base entities/reviews/users/moderation/trust remain canonical.
- Vertical-specific capabilities are additive via extension tables and modules:
  - Employer
  - School
  - Medical
  - Product

## 4. Current Implementation (Live Code Snapshot)

## 4.1 Backend Modules (implemented in codebase)

From `src/modules`:
- `auth`, `users`, `categories`, `entities`, `reviews`, `votes`, `reports`, `replies`
- `entity-claims`, `moderation`, `trust`, `search`, `notifications`, `audit`, `admin`, `health`
- Expansion modules:
  - `employer-profiles`
  - `response-metrics`
  - `badges`
  - `review-invites`
  - `follows`
  - `issue-resolutions`
  - `category-extensions`
  - `community-validations`
  - `review-quality`
  - `review-streaks`
  - `campaigns`
  - `analytics`
  - `response-templates`
  - `onboarding`
  - `blogs`
  - `discussions`
  - `realtime`

### 4.2 Web App Pages (implemented)

Key routes include:
- Public: `/`, `/feed`, `/search`, `/categories`, `/entities/[id]`, `/blogs`, `/blogs/[slug]`, `/discussions`
- Auth: `/auth/login`, `/auth/register`, `/auth/verify`
- Entity creation/review: `/entities/add`, `/entities/[id]/review`
- User dashboard: `/dashboard`, `/dashboard/profile`, `/dashboard/notification`, `/dashboard/reviews`, `/dashboard/claims`, `/dashboard/saved`, `/dashboard/follows`, `/dashboard/streaks`, `/dashboard/badges`
- Campaign/onboarding/community pages present

### 4.3 Admin App Pages (implemented)

Key routes include:
- `/` dashboard
- `/users`
- `/moderation`, `/moderation/[id]`
- `/reviews`, `/reviews/[id]`
- `/claims`, `/claims/[id]`
- `/categories`
- `/entity-profiles`
- `/campaigns`
- `/response-templates`
- `/blogs`
- `/audit`
- Auth routes: `/auth/login`, `/auth/verify` (verify page exists in app routes; product policy should keep admin password-first)

## 5. Database Schema (Prisma Snapshot)

### 5.1 Core domain enums/models exist for:

- Identity/session: `User`, `UserDevice`, `Session`
- Catalog: `Category`, `WarningTag`, geo models (`Country`, `State`, `Timezone`, `City`, `Locality`)
- Entity/review core:
  - `Entity`, `EntityAlias`, `EntityClaim`
  - `Review`, `ReviewTagLink`, `ReviewVote`, `ReviewReport`, `ReviewReply`
- Moderation/trust/audit:
  - `ModerationCase`, `ModerationAction`
  - `DuplicateCandidate`, `DuplicateMergeVote`
  - `TrustScoreEvent`
  - `AuditLog`
  - `Notification`
- Billing placeholders: `BillingCustomer`, `BillingInvoice`

### 5.2 Extension models present:

- Employer: `EmployerProfile`, `WorkplaceReviewData`, `SalarySubmission`, `EntityResponseMetric`
- School: `SchoolProfile`, `SchoolReviewData`
- Medical: `MedicalProfile`, `MedicalReviewData`
- Product: `ProductProfile`, `ProductReviewData`
- Growth/engagement:
  - `Badge`
  - `ReviewInvite`
  - `IssueResolution`
  - `Follow`
  - `AnalyticsEvent`
  - `CommunityValidation`
  - `ReviewQualityScore`
  - `ReviewStreak`
  - `Campaign`, `CampaignParticipant`
  - `OnboardingPreference`
  - `ResponseTemplate`
  - `BlogPost`
  - `DiscussionPost`, `DiscussionComment`, `DiscussionReaction`

### 5.3 Recent migration timeline (high level)

- Initial + core
- Admin credentials seed/migration
- Country/state/city/timezone models
- Category icon/description
- Platform expansion foundation
- User email verification
- Text length constraints
- Blogs/discussions
- Legal consent + activity streaks

## 6. Functional Capabilities (By User)

### 6.1 Public User

- Browse/search entities and categories
- Read feed, reviews, trust, replies
- Read blogs
- Read and participate in discussions (after auth for write actions)
- View policies/privacy/terms pages

### 6.2 Authenticated User

- Register/login (email/password + verification paths present)
- Create entities/reviews/reports/votes/comments/discussion posts
- Save entities, manage profile, view notifications
- Follow targets, join campaigns, maintain streaks
- Submit/track entity claims

### 6.3 Claimed Owner / Employer

- Claim entity
- Reply to reviews
- Manage employer/category profile extensions
- Use invites/response-related tools (module support present)

### 6.4 Admin/Moderator

- Dashboard + user management
- Review moderation queue/detail + status actions
- Claims decision flow
- Category/response-template/campaign/blog management
- Audit log access

## 7. API Surface (Functional Summary)

Implemented endpoint groups include:
- Auth: register/login/admin login, email OTP request/verify, legacy OTP endpoints, refresh/logout
- Me/User: profile update, saved entities
- Category/location: categories/tags/cities/localities
- Entity/review: CRUD, feed, review admin status management
- Interaction: votes/reports/replies
- Governance: claims/moderation/trust/audit
- Discovery/comms: search, notifications
- Extensions: employer profile, school/medical/product profile APIs, review extension data
- Growth: badges, follows, review invites, issue resolutions, campaigns, analytics, onboarding, response templates
- Content/community: blogs, discussions

## 8. Business Flows (Canonical)

### 8.1 Discover -> Review -> Trust Loop

1. User searches entity.
2. Reads profile/reviews/trust signals.
3. Submits review.
4. Community votes/reports.
5. Risk/moderation updates state.
6. Trust recalculates and affects visibility.

### 8.2 Entity Claim + Owner Response Loop

1. User submits claim.
2. Admin approves/rejects.
3. Approved owner can respond and maintain profile.
4. Response behavior contributes to trust/reputation signals.

### 8.3 Engagement/Growth Loop

1. Campaigns, follows, badges, streaks drive recurring actions.
2. Notifications and invites pull users back.
3. Blogs/discussions increase top-of-funnel and retention.

## 9. Requirements Consolidation

### 9.1 Product Requirements

- Entity-first truth model
- Policy-safe UGC moderation
- Explainable trust and transparent outcomes
- Pakistan-first location/cultural fit
- Anonymous-capable participation for safety-sensitive contexts

### 9.2 Engineering Requirements

- Strong input validation + sanitization (API + client)
- Role-based authorization
- Auditability of sensitive actions
- Backward-compatible API evolution
- Pagination/search consistency (`page`, `pageSize`)

### 9.3 Operational Requirements

- CORS mapping for web/admin origins
- Environment-based secrets/config
- Migration discipline and seed alignment
- Monitoring for moderation and abuse signals

## 10. Where We Are Now (April 21, 2026)

Status summary:
- Platform has moved beyond MVP core into expansion modules.
- Major planned foundation items are now physically implemented in schema and module structure.
- Blogs/discussions and feed engagement surfaces are now implemented.
- Admin has moderation/reviews/claims plus content/config management surfaces.
- Some docs still describe earlier "planned/not started" status and need alignment with live code.

Known current reality:
- There is implementation velocity with many active/uncommitted changes across API/web/admin.
- Practical stabilization, cleanup, and docs-sync are now as important as net-new features.

## 11. What Changed Recently

High-impact changes now present in codebase:
- Geo model normalization (country/state/city/timezone/locality)
- Expanded extension architecture for employer/school/medical/product
- Admin and user feature expansion (campaigns, badges, follows, templates, invites)
- Email verification + OTP flows and auth hardening
- Added text-length constraints and stronger validations/sanitization
- New content products: blogs + discussions
- Feed/UI engagement improvements and additional dashboard surfaces

## 12. Gaps, Risks, and Constraints

### 12.1 Primary Gaps

- Single canonical documentation was missing (resolved by this file)
- Old docs (tracking/changelog) still contain stale "Not Started" statuses
- Need consolidated acceptance test matrix for end-to-end regressions
- Policy/legal operational runbooks require production-grade completion

### 12.2 Key Risks

- Product-doc drift causing team misalignment
- Feature breadth increasing QA burden
- Data-quality edge cases in extension flows
- Moderation/legal sensitivity for high-risk categories (medical/workplace)

## 13. What Is Next (Recommended Plan)

### Phase A: Stabilize (Immediate)

1. Freeze feature additions briefly.
2. Run full E2E sweep for web/admin/API critical flows.
3. Close route/API contract mismatches.
4. Ensure all migrations are applied and seed data consistent.
5. Reconcile docs 16-24 with actual implementation status.

### Phase B: Harden (Short-term)

1. Build a formal regression checklist (auth, entities, reviews, moderation, claims, campaigns, blogs/discussions).
2. Add API contract tests for pagination/filter semantics.
3. Add role-based test coverage and abuse-case tests.
4. Finalize admin password-only policy behavior and remove unused OTP admin UX paths if not needed.

### Phase C: Scale (Next)

1. Feed ranking evolution (trust + quality + recency scoring, controlled rollout).
2. Localization and content quality upgrades.
3. Stronger analytics dashboards for owners/admin.
4. Growth loops: invite effectiveness, follow recommendations, digest notifications.

## 14. Documentation Governance (Going Forward)

To keep this "single source of truth" accurate:
- Update this file first when major features/flows/schema change.
- Maintain a concise changelog section per sprint.
- Mark each doc as one of: `Canonical`, `Reference`, `Archived`.
- Sync implementation-tracking docs to real code weekly.

## 15. Quick Reference Appendix

### 15.1 Runtime Ports

- API: `5000`
- Admin: `5001`
- Web: `5002`

### 15.2 Primary Tech Stack

- API: NestJS 11, Prisma, PostgreSQL, Redis, Socket.IO
- Web/Admin: Next.js 16, React 19, React Query, Tailwind

### 15.3 Master Status

- Foundation: Implemented
- Expansion architecture: Implemented
- Stabilization/document sync: In progress
- Next focus: quality hardening + flow verification + docs alignment
