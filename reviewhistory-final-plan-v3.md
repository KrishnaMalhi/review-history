# ReviewHistory Platform — Full Final Implementation Plan

> **Version:** 3.0 — Final Merged
> **Prepared:** 2026-04-29
> **Scope:** Web app · Admin portal · NestJS API · PostgreSQL/Prisma DB
> **Sources:** Original spec · Claude enhancements · GPT enhancements — merged into single authoritative document

---

## How to Read This Document

Each phase has a **goal statement** followed by work items grouped by layer:

- `[DB]` — Prisma schema migration required
- `[API]` — NestJS endpoint or service change
- `[WEB]` — Next.js web app page or component
- `[ADMIN]` — Admin portal change
- `[CLIENT]` — Client-side infra (API helpers, sockets, state)

**Priority labels:** `[BLOCKER]` must ship before phase ends · `[HIGH]` strong ROI · `[MED]` improves depth · `[LOW]` polish

**Admin rule:** Every phase includes its own admin completion tasks. Phase 12 is final polish only — not a catch-all for missing admin functionality.

---

## Core Product Decision

> ReviewHistory is a **trust and reputation network** where the **entity profile is the center**.
> Every feature must connect back to: **entity · review · discussion · claim · owner response · user reputation · category · city · moderation signal**.
> It must never become a generic social network or status-posting platform.

---

## Pre-Phase Audit: What DB Has That Web/API Hasn't Exposed Yet

| DB Model / Feature | Exposed? | Gap |
|---|---|---|
| `ReviewQualityScore` | ❌ | Not shown on entity or feed cards |
| `CommunityValidation` enum (`confirmed/outdated/resolved`) | ⚠️ | Values never typed in web spec |
| `DuplicateCandidate` + `DuplicateMergeVote` | ❌ | No user-facing report-duplicate flow |
| `IssueResolution` | ❌ | Tracked in DB, zero UI state shown |
| `SalarySubmission` | ❌ | Model exists, zero web/admin spec coverage |
| `ReviewInvite.maxUses` + `expiresAt` | ⚠️ | DB has it, `POST /entities/:id/invites` doesn't send it |
| `EntityAlias` | ❌ | No admin or user flow to manage aliases |
| `EntityResponseMetric` | ⚠️ | Fetched in owner dashboard, never shown publicly |
| `ModerationAction` | ⚠️ | Only `resolve` exposed, not full action history |
| `AuditLog` | ⚠️ | Admin `/audit` page exists, no cross-linking from other modules |
| `TrustScoreEvent` | ❌ | No event timeline shown anywhere |
| `UserDevice` + fingerprint | ❌ | Collected silently, not in admin user detail |
| `businessHoursJson` on Entity | ⚠️ | Stored as blob; no "open now" logic anywhere |
| `ReviewHelpfulVote` voter identity | ❌ | Counts exist, voter ID not tracked → can't show "You voted this helpful" |
| `EntityVerificationDocument` | ❌ | Claim has one `evidenceUrl` string; no multi-doc model for admin review |
| `UserBanAppeal` | ❌ | Banned users have no structured appeal path |
| `EntityMergeHistory` | ❌ | Merge audit is only in AuditLog; no queryable merge trail per entity |
| `SearchQueryLog` | ❌ | No search analytics; blind to what users search but don't find |
| `NotificationTemplate` | ❌ | Notification content hardcoded; no admin-controlled email templates |
| `ReviewFlag` (auto-detection) | ❌ | No model for system-generated flags (PII, competitor, suspicious pattern) |
| `OwnerPost` | ❌ | No model; owners have no proactive communication layer on entity page |
| `EntityQA` | ❌ | No structured Q&A model separate from discussions |
| `WatchlistAlert` | ❌ | Users can follow entities but can't set threshold-based alerts |
| `EntityRelationship` | ❌ | No branch/rebrand/alias relationship graph |
| `EvidenceItem` (structured) | ❌ | Evidence is raw image array; no type/visibility/verification layer |
| `OwnerTeamMember` | ❌ | No multi-user team support for owned entities |
| `ReviewBombingIncident` | ❌ | Velocity detection exists as concept but no dedicated incident model |
| `UserLoginEvent` | ❌ | Device tracked; login events (IP, location, method, timestamp) not structured |
| `PlatformConfig` | ❌ | Business rules hardcoded; no admin-configurable rule table |

---

## Phase 0 — Foundation Hardening *(1–2 weeks)*

**Goal:** Fix broken flows, close spec gaps, expose what DB already has. Establish upload standards and client contracts. Zero new features.

### 0.1 Client Infrastructure `[BLOCKER]`

- `[CLIENT]` Add `429 Too Many Requests` handler to `apiGet/apiPost/apiPatch/apiDelete` — read `Retry-After` header, exponential backoff
- `[CLIENT]` Add `403` handler — show "access denied" page/toast, never silently fail
- `[CLIENT]` Add `5xx` stable fallback — generic error message, never expose raw server errors
- `[CLIENT]` Add network error catch-all — show retry CTA
- `[CLIENT]` Socket reconnect handler: on `disconnect`, re-join all active rooms, refetch cursor delta since last `nextCursor`, deduplicate incoming events
- `[CLIENT]` Optimistic UI for: review votes, comment reactions, discussion reactions, follow/unfollow, save/unsave, notification read — update local state instantly, revert on API error with toast
- `[CLIENT]` Feed scroll position restoration: persist `nextCursor` + scroll offset in `sessionStorage` keyed by route, restore on back-navigation
- `[CLIENT]` Add **request deduplication**: if the same GET URL fires twice within 200ms, deduplicate into one in-flight promise
- `[CLIENT]` Add **global skeleton standards**: define a `<Skeleton>` component used uniformly across all cards — prevents layout shift

### 0.2 Upload Service Standard `[BLOCKER]`

Move upload architecture here — reviews, discussions, avatars, entity logos, claim documents, and evidence all depend on correct upload behavior before any other phase:

- `[API]` `POST /upload/presigned` — `{ filename, mimeType, context: 'review'|'discussion'|'profile'|'entity'|'evidence'|'claim_doc' }` → `{ uploadUrl, fileUrl }`
- `[CLIENT]` Upload file directly to CDN via presigned URL with real progress bar; submit `fileUrl` strings to form endpoints instead of binary
- `[CLIENT]` Client-side validation before every upload: MIME type check, max 5MB, inline size error
- `[CLIENT]` Client-side image compression using `browser-image-compression` before upload
- `[CLIENT]` Image preview after selection with remove (×) button before final submit
- `[API]` Server-side: re-validate MIME type, enforce max dimensions, auto-compress via `sharp` before CDN storage
- `[WEB]` Consistent `<UploadInput>` component reused across all forms
- Keep existing multipart routes as fallback for backward compatibility

### 0.3 Auth Flow Documentation `[BLOCKER]`

- `[API]` Document `/auth/login` response shape when `requiresVerification: true` — must explicitly return `{ requiresVerification, otpRequestId, email }` — currently undocumented
- `[WEB]` `/auth/login` — read `otpRequestId` from login response body before redirecting to `/auth/verify`, not from URL construction

### 0.4 Expose Already-Built DB Features `[HIGH]`

- `[API]` Enforce `CommunityValidationType` enum (`confirmed | outdated | resolved`) as typed DTO in `POST /reviews/:id/validations`
- `[API]` `GET /reviews/:id/validations` — include counts per `validationType`
- `[WEB]` Review cards: show `ReviewQualityScore.totalScore` as quality badge (`Detailed` / `Brief`)
- `[WEB]` Review cards: show `IssueResolution.status` — if `resolved_by_owner` → "Owner resolved this"; if `confirmed_resolved` → "Resolved ✓"
- `[WEB]` Owner dashboard reviews tab: show `IssueResolution` status column per review
- `[API]` `POST /entities/:id/invites` — accept and persist `maxUses?`, `expiresAt?`, `label?`
- `[ADMIN]` User detail: show `UserDevice` list (fingerprint hash, risk score, first/last seen)

### 0.5 Platform Config Table `[HIGH]`

Centralize all configurable business rules — prevents hardcoded thresholds scattered across services:

- `[DB]` New model:
  ```prisma
  model PlatformConfig {
    key        String   @id @db.VarChar(100)
    value      String   @db.Text
    valueType  String   @default("string") @db.VarChar(20) // string|number|boolean|json
    category   String   @default("general") @db.VarChar(50)
    description String? @db.VarChar(300)
    updatedAt  DateTime @updatedAt @map("updated_at")
    @@map("platform_config")
  }
  ```
- Seed defaults: `review.max_per_day=3`, `review.min_per_entity_interval_months=6`, `moderation.toxicity_threshold=0.8`, `search.autocomplete_max=5`, `invite.max_per_entity_per_month=100`, `claim.doc_expiry_days=365`
- `[API]` Config service: `ConfigService.get(key)` — used by all modules instead of hardcoded values
- `[API]` `GET /admin/config` · `PATCH /admin/config/:key`
- `[ADMIN]` New page `/admin/config` — key-value editor grouped by category

### 0.6 Notification Read-All `[HIGH]`

- `[API]` `PATCH /notifications/read-all` already exists — wire it to web
- `[WEB]` `/dashboard/notification` — add "Mark all as read" button

### 0.7 Analytics Fire-and-Forget `[MED]`

- `[WEB]` `POST /analytics/entities/:id/page-view` — make non-blocking (fire-and-forget), debounce to ignore repeat calls within 30s for same entity in same tab session

### 0.8 Onboarding Re-Entry `[MED]`

- `[API]` `PUT /onboarding/preferences` already exists — expose it from profile dashboard
- `[WEB]` `/dashboard/profile` — add "Update Interests" section calling `PUT /onboarding/preferences`

### 0.9 Admin Stability `[MED]`

- `[ADMIN]` Add session-expired error boundary — currently admin may silently fail on expired session
- `[ADMIN]` Add proper "Access Denied" page for unauthorized role access
- `[ADMIN]` Verify admin auth refresh flow matches web pattern
- `[ADMIN]` Add session activity indicator: "Active X minutes ago" on admin nav
- `[API]` Attach `X-Request-ID` (UUID) to every response (success and error envelopes)
- `[API]` Add `GET /health/deep` (admin-only): checks DB, Redis, upload service reachability per-service

---

## Phase 1 — User Identity & Profile Depth *(2–3 weeks)*

**Goal:** Give users a real identity — avatar, public profile, privacy controls, account security, login history, device management.

### 1.1 User Avatar `[BLOCKER]`

- `[DB]` Add to `User`: `avatarUrl String? @map("avatar_url") @db.VarChar(500)`
- `[API]` `POST /me/avatar` — uses presigned upload flow (Phase 0.2), returns `{ avatarUrl }`
- `[API]` `DELETE /me/avatar` — remove avatar, set to null
- `[WEB]` Profile page: avatar upload with client-side crop preview, remove button
- `[ADMIN]` User detail: show avatar thumbnail

### 1.2 Account Security `[BLOCKER]`

- `[API]` `PATCH /me/password` — `{ currentPassword, newPassword }` — verify current, add audit log
- `[API]` `POST /me/change-email` — `{ newEmail, password }` → verify password, send OTP → returns `otpRequestId`
- `[API]` `POST /me/verify-change-email` — `{ otpRequestId, code }` → confirm, update email, revoke other sessions
- `[API]` `DELETE /me` — soft-delete: set `deletedAt`, anonymize PII (`email → deleted+uuid`, `phoneE164 → deleted`), revoke all sessions (GDPR/PDPA)
- `[DB]` Add to `User`: `deactivatedAt DateTime?`, `deletedReason String? @db.VarChar(200)`
- `[WEB]` `/dashboard/profile` — account settings: password change, email change, deletion flow with explicit consequence modal

### 1.3 Username Slug `[HIGH]`

- `[API]` `PATCH /me` — accept `usernameSlug` with uniqueness validation (alphanumeric + hyphens, 3–30 chars)
- `[API]` `GET /me/check-username?slug=` — returns `{ available: boolean }`
- `[WEB]` Profile page: editable username field with debounced availability check
- `[WEB]` Public profile URL: `/users/[usernameSlug]`

### 1.4 Public User Profile `[HIGH]`

- `[API]` `GET /users/:usernameOrId` — public-safe profile: avatar, displayName, city (if public), bio, badges, stats, contributorLevel
- `[API]` `GET /users/:id/reviews` — paginated public reviews
- `[API]` `GET /users/:id/discussions` — paginated public discussions
- `[API]` `GET /users/:id/reputation` — public reputation summary
- `[WEB]` New route `/users/[usernameSlug]`: avatar, name, city, bio, member since, contributor level, badge grid, streak stats, public reviews, public discussions, followers/following + Follow button
- `[WEB]` All review/discussion/comment author names → link to `/users/:id`

### 1.5 Privacy Settings `[HIGH]`

- `[DB]` New model:
  ```prisma
  model UserPrivacySettings {
    id                   String  @id @default(uuid()) @db.Uuid
    userId               String  @unique @map("user_id") @db.Uuid
    isProfilePrivate     Boolean @default(false) @map("is_profile_private")
    showCityPublicly     Boolean @default(true)  @map("show_city_publicly")
    showReviewsPublicly  Boolean @default(true)  @map("show_reviews_publicly")
    showBadgesPublicly   Boolean @default(true)  @map("show_badges_publicly")
    showStreaksPublicly  Boolean @default(true)  @map("show_streaks_publicly")
    allowFollowers       Boolean @default(true)  @map("allow_followers")
    defaultAnonymous     Boolean @default(false) @map("default_anonymous")
    user User @relation(fields: [userId], references: [id])
    @@map("user_privacy_settings")
  }
  ```
- `[API]` `GET /me/privacy` · `PATCH /me/privacy`
- `[WEB]` Privacy settings panel in `/dashboard/profile`

### 1.6 Contributor Levels `[MED]`

- `[DB]` Add to `User`: `contributorLevel String @default("new_member") @map("contributor_level") @db.VarChar(30)`
- Levels: `new_member → verified_member → helpful_reviewer → trusted_contributor → community_expert → category_expert`
- `[API]` Background job: recalculate on review/vote/badge milestones; include in `GET /me` and `GET /users/:id`
- `[WEB]` Contributor level label + progress hint on public profile and dashboard sidebar

### 1.7 Phone Verification `[MED]`

- `[API]` `POST /auth/request-phone-otp` · `POST /auth/verify-phone` → set `isPhoneVerified = true`
- `[WEB]` Profile page: "Verify your phone number" CTA when `isPhoneVerified = false`

### 1.8 Login History & Device Management `[MED]`

- `[DB]` New model:
  ```prisma
  model UserLoginEvent {
    id          String   @id @default(uuid()) @db.Uuid
    userId      String   @map("user_id") @db.Uuid
    ipAddress   String?  @map("ip_address") @db.VarChar(45)
    userAgent   String?  @map("user_agent") @db.VarChar(500)
    countryCode String?  @map("country_code") @db.VarChar(5)
    cityName    String?  @map("city_name") @db.VarChar(100)
    loginAt     DateTime @default(now()) @map("login_at")
    method      String   @default("email") @db.VarChar(20) // email|google|apple|otp
    success     Boolean  @default(true)
    user        User     @relation(fields: [userId], references: [id])
    @@index([userId, loginAt(sort: Desc)])
    @@map("user_login_events")
  }
  ```
- `[API]` Write `UserLoginEvent` on every login; flag events from new countries
- `[API]` `POST /auth/logout-all` — revoke all sessions except current
- `[WEB]` `/dashboard/profile` → "Recent sign-ins" section: last 5 events with time, method, location
- `[WEB]` "Log out all other devices" button
- `[ADMIN]` User detail: login history tab, suspicious foreign-country login flag

### 1.9 User Ban Appeal `[MED]`

- `[DB]` New model:
  ```prisma
  model UserBanAppeal {
    id                String    @id @default(uuid()) @db.Uuid
    userId            String    @map("user_id") @db.Uuid
    reason            String    @db.Text
    evidenceUrls      String[]  @default([]) @map("evidence_urls")
    status            String    @default("pending") @db.VarChar(20)
    adminNotes        String?   @map("admin_notes") @db.Text
    reviewedByAdminId String?   @map("reviewed_by_admin_id") @db.Uuid
    reviewedAt        DateTime? @map("reviewed_at")
    createdAt         DateTime  @default(now()) @map("created_at")
    @@index([userId, status])
    @@map("user_ban_appeals")
  }
  ```
- `[API]` `POST /me/ban-appeal` — `{ reason, evidenceUrls? }` — only when user status is `banned`
- `[WEB]` On login with banned status: show ban reason + "Submit Appeal" CTA
- `[ADMIN]` Appeals queue at `/admin/users/appeals`

---

## Phase 2 — Entity Profile Richness & Trust Graph *(3–4 weeks)*

**Goal:** Make entity pages the credible centerpiece. Media, rich metadata, trust summary, review summary, entity relationships, similar/comparison entities, duplicate reporting.

### New Entity Page Layout

```
Entity Header
 ├── logo · cover image · name · category · city/locality
 ├── verified/claimed badge with tier · trust score · avg rating · open-now chip
 └── Follow · Save · Set Alert · Write Review · Claim / Report

Trust Overview
 ├── Trust Score · Review Count · Verified Review % · Health Score ring
 ├── Owner Response Rate · Avg Response Time · Resolution Rate
 ├── Sentiment Trend (recent 30 days) · Category Benchmark percentile

Review Summary
 ├── Rating breakdown · Common positive tags
 ├── Common warning tags · Recent complaints
 └── Owner response summary · Freshness stats

Entity Tabs
 ├── Reviews
 ├── Q&A
 ├── Discussions (entity-linked)
 ├── About (metadata, hours, map, links)
 ├── Trust & Verification (timeline + documents)
 ├── Owner Updates (owner posts)
 ├── Photos / Evidence
 ├── Similar Entities
 └── Related Entities (trust graph)
```

### 2.1 Entity Base Media & Metadata `[BLOCKER]`

- `[DB]` Add to `Entity`:
  ```prisma
  logoUrl           String?  @map("logo_url") @db.VarChar(500)
  coverImageUrl     String?  @map("cover_image_url") @db.VarChar(500)
  galleryUrls       String[] @default([]) @map("gallery_urls")
  description       String?  @db.Text
  websiteUrl        String?  @map("website_url") @db.VarChar(500)
  officialEmail     String?  @map("official_email") @db.VarChar(255)
  businessHoursJson Json?    @map("business_hours_json")
  socialLinksJson   Json?    @map("social_links_json")
  latitude          Decimal? @db.Decimal(10,7)
  longitude         Decimal? @db.Decimal(10,7)
  displayNameUr     String?  @map("display_name_ur") @db.VarChar(200)
  ```
- `[API]` `PATCH /entities/:id/profile` — accepts enriched metadata fields (owner + admin)
- `[API]` `GET /entities/:id` — compute and return `isOpenNow: boolean` and `nextOpenAt: string | null` from `businessHoursJson` + entity timezone
- `[WEB]` Entity header: logo, cover, website, social, open-now chip, Urdu name when set
- `[WEB]` About tab: hours, official email, description, alternate phones, gallery, map pin (Google Maps static/OpenStreetMap)
- `[ADMIN]` Entity create/edit: all new fields including lat/lng with map preview, Urdu name

### 2.2 Entity Trust Graph `[HIGH]`

Bad entities often change name, reopen under new pages, or operate under related branches. This closes that gap:

- `[DB]` New model:
  ```prisma
  model EntityRelationship {
    id               String   @id @default(uuid()) @db.Uuid
    sourceEntityId   String   @map("source_entity_id") @db.Uuid
    targetEntityId   String   @map("target_entity_id") @db.Uuid
    relationType     String   @map("relation_type") @db.VarChar(40)
    // branch_of|same_owner|same_brand|rebranded_from|merged_into|formerly_known_as|franchise_of
    confidenceScore  Decimal  @default(1.0) @map("confidence_score") @db.Decimal(3,2)
    status           String   @default("active") @db.VarChar(20)
    verifiedByAdminId String? @map("verified_by_admin_id") @db.Uuid
    note             String?  @db.VarChar(300)
    createdAt        DateTime @default(now()) @map("created_at")
    sourceEntity     Entity   @relation("RelationshipSource", fields: [sourceEntityId], references: [id])
    targetEntity     Entity   @relation("RelationshipTarget", fields: [targetEntityId], references: [id])
    @@index([sourceEntityId])
    @@index([targetEntityId])
    @@map("entity_relationships")
  }
  ```
- `[API]` `GET /entities/:id/relationships` — returns related entities grouped by `relationType`
- `[API]` `POST /admin/entities/relationships` — `{ sourceEntityId, targetEntityId, relationType, note? }`
- `[API]` `DELETE /admin/entities/relationships/:id`
- `[WEB]` Entity page "Related Entities" tab:
  - "Other branches" (branch_of)
  - "Also operates as…" (same_brand / rebranded_from)
  - "Previously known as…" (formerly_known_as)
  - "Related entities" (same_owner)
  - Each linked entity shows name + rating + city chip
- `[ADMIN]` Entity detail: Relationships tab — add/edit/delete relationships with type selector
- `[ADMIN]` Visual relationship map: entity name nodes connected by relation type labels

### 2.3 Trust Summary API `[HIGH]`

- `[API]` `GET /entities/:id/trust-summary` — returns:
  ```ts
  {
    trustScore: number;
    reviewCount: number;
    verifiedReviewPercent: number;
    ownerResponseRate: number;
    averageResponseTimeHours: number | null;
    complaintResolutionRate: number;
    suspiciousReviewCount: number;
    hiddenReviewCount: number;
    latestTrustEvents: { eventType, weight, effectiveAt }[];
    verificationTierLabel: string;
    verificationTierNext: string | null;
  }
  ```
- Response rate labels: >80% → "Fast Responder" · >50% → "Usually Responds" · <20% → "Low Response Rate"
- `[WEB]` Trust Overview: 4 KPI cards + sentiment sparkline + response rate label

### 2.4 Owner Accountability Score — Public Display `[HIGH]`

- `[API]` `GET /entities/:id/owner-accountability` — returns:
  ```ts
  {
    avgFirstResponseHours: number | null;
    negativeReviewResponseRate: number;
    complaintResolutionConfirmRate: number;
    reopenedDisputeCount: number;
    ownerResolvedButDisputedCount: number;
    accountabilityLabel: string; // "Fast Responder"|"Usually Responds"|"Low Response Rate"|"High Unresolved Rate"
  }
  ```
- `[WEB]` Entity Trust Overview: accountability section (merged with response metrics)
- `[ADMIN]` Entity detail: accountability metrics panel

### 2.5 Review Summary API `[HIGH]`

- `[API]` `GET /entities/:id/review-summary` — returns:
  ```ts
  {
    ratingBreakdown: { 1: n, 2: n, 3: n, 4: n, 5: n };
    topPositiveTags: { key, label, count }[];
    topWarningTags: { key, label, count }[];
    recentComplaints: Review[];
    ownerRepliedCount: number;
    ownerRepliedPercent: number;
    communityValidatedCount: number;
    reviewsLast12MonthPercent: number;
  }
  ```
- `[WEB]` Review summary section above reviews tab

### 2.6 Entity Status Visibility `[HIGH]`

- `[WEB]` Entity page: status badge per `EntityStatus`:
  - `claimed` → "Claimed" chip
  - `under_review` → warning banner
  - `suspended` → full-page warning with reason
  - `merged` → redirect to canonical + "This listing was merged into [X]"
- `[WEB]` Verification tier badge: Level 1 "Claimed" · Level 2 "Email Verified" · Level 3 "Document Verified" · Level 4 "Admin Verified" (gold) · Level 5 "Trusted Owner" (special)

### 2.7 Suggest Entity Edit `[HIGH]`

- `[DB]` New model:
  ```prisma
  model EntitySuggestedEdit {
    id                String    @id @default(uuid()) @db.Uuid
    entityId          String    @map("entity_id") @db.Uuid
    suggestedByUserId String?   @map("suggested_by_user_id") @db.Uuid
    fieldName         String    @map("field_name") @db.VarChar(100)
    oldValue          String?   @map("old_value") @db.Text
    newValue          String    @map("new_value") @db.Text
    evidenceUrl       String?   @map("evidence_url") @db.VarChar(500)
    note              String?   @db.VarChar(500)
    status            String    @default("pending") @db.VarChar(20)
    reviewedByAdminId String?   @map("reviewed_by_admin_id") @db.Uuid
    reviewedAt        DateTime? @map("reviewed_at")
    createdAt         DateTime  @default(now()) @map("created_at")
    entity Entity @relation(fields: [entityId], references: [id])
    @@index([entityId, status])
    @@map("entity_suggested_edits")
  }
  ```
- `[API]` `POST /entities/:id/suggest-edits` · `GET /entities/:id/suggested-edits`
- `[API]` `POST /admin/entities/:id/suggested-edits/:editId/approve` · `/reject`
- `[WEB]` "Suggest an Edit" link on entity page (auth required)
- `[ADMIN]` Entity detail: suggested edits queue tab

### 2.8 Duplicate Entity Report & Merge `[HIGH]`

- `[API]` `POST /entities/:id/report-duplicate` — `{ duplicateEntityId, reason? }`
- `[API]` `POST /admin/entities/duplicates/:id/merge` — `{ canonicalEntityId }`:
  - Source → `status: merged`; create `EntityAlias` entries; move reviews/claims/followers to canonical
  - Emit `entity_merged` notification; audit log entry; 301 redirect for old URL
- `[WEB]` Entity page overflow menu → "Report as duplicate"
- `[ADMIN]` Duplicates queue at `/admin/entities/duplicates` with side-by-side comparison UI

### 2.9 Entity Map & "Open Now" `[HIGH]`

- `[API]` `GET /search/entities` — add `openNow=true` filter (server-computed from hours + timezone)
- `[WEB]` Entity About tab: embedded map pin when lat/lng exist
- `[WEB]` Search results: "Open Now" filter toggle + optional map view of entity pins per locality
- `[WEB]` Entity header: "Open Now ●" / "Closed · Opens [day] [time]"

### 2.10 Entity Verification Documents `[HIGH]`

- `[DB]` New model:
  ```prisma
  model EntityVerificationDocument {
    id                String    @id @default(uuid()) @db.Uuid
    entityId          String    @map("entity_id") @db.Uuid
    claimId           String?   @map("claim_id") @db.Uuid
    uploadedByUserId  String    @map("uploaded_by_user_id") @db.Uuid
    docType           String    @map("doc_type") @db.VarChar(50)
    // ntn_certificate|registration_cert|utility_bill|trade_license|govt_id|other
    fileUrl           String    @map("file_url") @db.VarChar(500)
    isVerified        Boolean   @default(false) @map("is_verified")
    verifiedByAdminId String?   @map("verified_by_admin_id") @db.Uuid
    verifiedAt        DateTime? @map("verified_at")
    expiresAt         DateTime? @map("expires_at")
    createdAt         DateTime  @default(now()) @map("created_at")
    entity            Entity    @relation(fields: [entityId], references: [id])
    @@index([entityId, docType])
    @@map("entity_verification_documents")
  }
  ```
- `[API]` `POST /entities/:id/verification-documents` · `GET /admin/entities/:id/verification-documents`
- `[API]` `PATCH /admin/entities/:id/verification-documents/:docId/verify`
- `[ADMIN]` Entity detail: Verification Documents tab with inline PDF/image viewer, per-doc verify action

### 2.11 Entity Comparison `[HIGH]`

- `[API]` `GET /entities/compare?ids=id1,id2,id3` — comparison payload for up to 3 entities:
  avg rating, trust score, review count, response rate, resolution rate, top positive/warning tags, category-specific ratings
- `[WEB]` `/compare?entities=id1,id2` — side-by-side comparison page
- `[WEB]` Entity page: "Compare with similar" CTA
- `[WEB]` Search results: multi-select + "Compare selected" action

### 2.12 Similar & Nearby Entities `[MED]`

- `[API]` `GET /entities/:id/similar` — ranked: same category+locality → same category+city → same category+nearby city
- `[API]` `GET /entities/nearby?lat=&lng=&radius=&categoryKey?` — sorted by distance then trust score
- `[WEB]` Entity page: Similar Entities tab / side rail; Nearby tab when coordinates available

### 2.13 Salary Submissions `[MED]`

- `[API]` `POST /entities/:entityId/salary-submissions` · `GET /entities/:entityId/salary-submissions`
- `[WEB]` Employer entity pages: "Salary Insights" tab with anonymized salary ranges per job title
- `[ADMIN]` Entity detail: salary submissions tab

### 2.14 Trust Score Event Timeline `[MED]`

- `[API]` `GET /entities/:id/trust/history` — sanitized public event timeline
- `[WEB]` Entity Trust & Verification tab: expandable timeline with human-readable labels

### 2.15 Entity Phone & Website Click Tracking `[LOW]`

- `[API]` `POST /analytics/entities/:id/phone-click` · `POST /analytics/entities/:id/website-click` — fire-and-forget
- `[WEB]` Phone/website: fire analytics event before opening `tel:` or external link
- `[ADMIN]` Entity analytics: "Phone clicks" and "Website clicks" KPI cards

---

## Phase 3 — Reviews Quality, Evidence & Lifecycle *(3–4 weeks)*

**Goal:** Make reviews structured, credible, lifecycle-aware, evidence-backed, category-specific, and harder to fake.

### 3.1 Category-Specific Review Templates `[BLOCKER]`

Different categories need different structured fields — this creates queryable, summarizable data without requiring AI:

- `[DB]` Category extension review fields already exist (`categoryData` JSON on Review) — enforce typed schemas per category
- `[WEB]` Review form: category-aware rated dimensions rendered from category config:

  **Employer:** salary fairness · management behavior · work-life balance · career growth · job security · interview experience
  **School:** teacher quality · fee transparency · discipline · facilities · safety · parent communication
  **Clinic/Hospital/Doctor:** wait time · staff behavior · billing transparency · diagnosis confidence · cleanliness · emergency handling
  **Landlord/Rental:** deposit return · maintenance responsiveness · privacy respect · rent increase fairness · agreement transparency
  **Product:** durability · value for money · warranty service · authenticity concern · after-sales support

- `[WEB]` Review form: category rating completion meter ("3/6 fields completed") — encourages structured data
- `[API]` Review create/edit DTO: validate `categoryData` shape against category-specific schema

### 3.2 Review Type `[HIGH]`

- `[DB]` Add `reviewType String @default("experience") @map("review_type") @db.VarChar(30)` to `Review`
  - Values: `experience | complaint | warning | recommendation | question | update | resolution`
- `[API]` Accept `reviewType` in create and edit
- `[WEB]` Review form: optional type selector; review cards: type chip ("⚠️ Complaint", "✓ Recommendation")

### 3.3 Structured Evidence Items `[HIGH]`

Replace raw image array with a proper evidence model that supports private/verified evidence:

- `[DB]` New model:
  ```prisma
  model EvidenceItem {
    id             String    @id @default(uuid()) @db.Uuid
    reviewId       String?   @map("review_id") @db.Uuid
    claimId        String?   @map("claim_id") @db.Uuid
    uploadedById   String    @map("uploaded_by_id") @db.Uuid
    fileUrl        String    @map("file_url") @db.VarChar(500)
    evidenceType   String    @map("evidence_type") @db.VarChar(40)
    // receipt|invoice|appointment_slip|salary_slip|chat_screenshot|photo|document|other
    visibility     String    @default("public") @db.VarChar(30)
    // public | private_admin | private_owner_on_consent
    status         String    @default("pending") @db.VarChar(30)
    // pending|verified|rejected|redacted
    redactedUrl    String?   @map("redacted_url") @db.VarChar(500)
    reviewedById   String?   @map("reviewed_by_id") @db.Uuid
    reviewedAt     DateTime? @map("reviewed_at")
    createdAt      DateTime  @default(now()) @map("created_at")
    @@index([reviewId])
    @@index([claimId])
    @@index([status])
    @@map("evidence_items")
  }
  ```
- `[API]` On review submit: accept `evidenceItems[]` each with `evidenceType` + `visibility` + `fileUrl` (from presigned upload)
- `[API]` `GET /admin/moderation/evidence-queue` — pending evidence items needing admin verification
- `[API]` `PATCH /admin/evidence/:id` — `{ action: 'verify' | 'reject' | 'redact', redactedUrl? }`
- `[WEB]` Review form: evidence upload with type selector per file + visibility toggle ("Public" / "Private — verified by admin only")
- `[WEB]` Review cards:
  - "Evidence attached" chip → shows public evidence
  - "Private evidence verified by admin" badge when `status = verified` + `visibility = private_admin`
- `[WEB]` Private evidence UI: user uploads sensitive document (e.g. salary slip, patient record), it is never shown publicly; admin verifies it and sets review badge
- `[ADMIN]` Evidence queue page: per-item viewer, redact sensitive areas, verify/reject actions

### 3.4 Review Quality Score — Full Implementation `[HIGH]`

- `[DB]` Expand `ReviewQualityScore`:
  ```prisma
  textDepthScore        Decimal @default(0) @db.Decimal(3,2)
  evidenceScore         Decimal @default(0) @db.Decimal(3,2)
  reviewerTrustScore    Decimal @default(0) @db.Decimal(3,2)
  categoryDataScore     Decimal @default(0) @db.Decimal(3,2)
  helpfulnessScore      Decimal @default(0) @db.Decimal(3,2)
  reportPenalty         Decimal @default(0) @db.Decimal(3,2)
  duplicatePenalty      Decimal @default(0) @db.Decimal(3,2)
  spamPenalty           Decimal @default(0) @db.Decimal(3,2)
  fakeScore             Decimal @default(0) @db.Decimal(3,2)
  label                 String  @default("basic") @db.VarChar(30)
  calculatedAt          DateTime @default(now())
  ```
- Quality labels: `low_quality | basic | detailed | evidence_backed | trusted`
- `fakeScore` formula: `spamPenalty + duplicatePenalty + (1 - reviewerTrustScore) + autoFlagCount × 0.1`
- `[API]` Background job: recalculate on review create/edit/vote/report/validation
- `[WEB]` Review cards: quality badge per label; `evidence_backed` and `trusted` get prominent styling; `low_quality` gets reduced visual weight
- `[ADMIN]` Review detail: quality score breakdown + fake score panel; sortable `fakeScore` column in review list

### 3.5 Review Auto-Flagging `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ReviewFlag {
    id           String    @id @default(uuid()) @db.Uuid
    reviewId     String    @map("review_id") @db.Uuid
    flagType     String    @map("flag_type") @db.VarChar(50)
    // pii_phone|pii_email|pii_cnic|competitor_mention|profanity|url_spam
    // duplicate_text|coordinated_pattern|review_bomb_window
    matchedText  String?   @map("matched_text") @db.VarChar(200)
    autoDetected Boolean   @default(true) @map("auto_detected")
    resolvedAt   DateTime? @map("resolved_at")
    createdAt    DateTime  @default(now()) @map("created_at")
    review       Review    @relation(fields: [reviewId], references: [id])
    @@map("review_flags")
  }
  ```
- `[API]` After every review save, async auto-flag pipeline:
  - **PII scan:** detect Pakistani phone (`03XX`), email, CNIC (`XXXXX-XXXXXXX-X`) patterns in body
  - **Competitor mention:** scan body against entity names in same category in same city
  - **Profanity check:** match against configurable word list (admin-managed via `/admin/moderation/word-filters`)
  - **Duplicate text:** `pg_trgm` trigram similarity >0.8 against last 50 reviews on same entity
  - **Toxicity score:** all-caps / excessive punctuation / length check
- If flagged → create `ReviewFlag`, set `moderationState = 'auto_flagged'`, create `ModerationCase`
- `[ADMIN]` Moderation queue: "Auto-flagged" sub-queue; review detail: auto-detection flags panel with matched snippet and redact/dismiss actions
- `[ADMIN]` `/admin/moderation/word-filters` — configurable profanity/spam phrase list with bulk import

### 3.6 Review Update (Append, Not Replace) `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ReviewUpdate {
    id           String    @id @default(uuid()) @db.Uuid
    reviewId     String    @map("review_id") @db.Uuid
    authorUserId String    @map("author_user_id") @db.Uuid
    body         String    @db.Text
    evidenceUrls String[]  @default([]) @map("evidence_urls")
    updateType   String    @default("follow_up") @map("update_type") @db.VarChar(30)
    // follow_up|owner_resolved|issue_worsened|correction|additional_evidence
    editedAt     DateTime? @map("edited_at")
    createdAt    DateTime  @default(now()) @map("created_at")
    review Review @relation(fields: [reviewId], references: [id])
    @@map("review_updates")
  }
  ```
- `[API]` `POST /reviews/:id/updates` — author only, max 3 updates per review
- `[WEB]` Review detail: chronological timeline showing original review + updates; "Add Update" distinct from "Edit Review"

### 3.7 Correction / Right-of-Reply Flow `[HIGH]`

Formal process for disputed content — reduces legal risk and gives owners fair recourse:

- `[DB]` New model:
  ```prisma
  model ReviewCorrectionRequest {
    id                String    @id @default(uuid()) @db.Uuid
    reviewId          String    @map("review_id") @db.Uuid
    requestedByUserId String    @map("requested_by_user_id") @db.Uuid
    correctionType    String    @map("correction_type") @db.VarChar(50)
    // wrong_entity|false_info|pii_exposed|outdated|legal_concern
    reason            String    @db.VarChar(500)
    evidenceUrls      String[]  @default([]) @map("evidence_urls")
    status            String    @default("pending") @db.VarChar(20)
    reviewerResponse  String?   @map("reviewer_response") @db.VarChar(500)
    adminNotes        String?   @map("admin_notes") @db.Text
    resolvedAt        DateTime? @map("resolved_at")
    createdAt         DateTime  @default(now()) @map("created_at")
    @@unique([reviewId, requestedByUserId])
    @@map("review_correction_requests")
  }
  ```
- `[API]` `POST /reviews/:id/correction-request` — owner only (must own entity the review is on)
- `[API]` Notification to reviewer on new correction request with: edit / add evidence / reject options
- `[API]` `PATCH /reviews/:id/correction-request/:reqId` — reviewer response: `{ action: 'edit' | 'add_evidence' | 'reject', response? }`
- `[API]` `GET /admin/reviews/correction-requests` · `PATCH /admin/reviews/correction-requests/:id`
- Admin actions on correction: keep / hide / redact / request evidence / mark legal-sensitive
- `[WEB]` Owner review management: "Request Correction" option per review with type selector + evidence upload
- `[WEB]` Reviewer notification: "Owner has requested a correction on your review at [Entity]" with inline response form
- `[ADMIN]` Correction queue at `/admin/reviews/correction-requests`

### 3.8 Review Backend Drafts `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ReviewDraft {
    id           String   @id @default(uuid()) @db.Uuid
    entityId     String   @map("entity_id") @db.Uuid
    authorUserId String   @map("author_user_id") @db.Uuid
    payloadJson  Json     @map("payload_json")
    createdAt    DateTime @default(now()) @map("created_at")
    updatedAt    DateTime @updatedAt @map("updated_at")
    @@unique([entityId, authorUserId])
    @@map("review_drafts")
  }
  ```
- `[API]` `POST /reviews/drafts` · `PATCH /reviews/drafts/:id` · `DELETE /reviews/drafts/:id` · `GET /reviews/drafts/entity/:entityId`
- `[WEB]` Review form: debounced autosave to `localStorage` (immediate) + API (every 30s); "Continue draft?" restore banner

### 3.9 Review Form Improvements `[HIGH]`

- `[WEB]` Minimum `body` 30 chars with live character counter; `@MinLength(30) @MaxLength(5000)` in DTO
- `[WEB]` "Preview" step before final submit
- `[WEB]` Review freshness indicator: if review is older than 12 months, show muted "Reviewed [X] ago" on review cards

### 3.10 Community Validation UI `[MED]`

- `[WEB]` Validation button: 3-option picker — "I had a similar experience" · "This seems outdated" · "Issue was resolved"
- `[WEB]` Review card: "12 confirmed this · 3 say outdated"

### 3.11 IssueResolution Full Flow `[MED]`

- `[WEB]` Review card: if `resolved_by_owner` → "Owner marked as resolved" with CTA to confirm or dispute
- `[API]` `PATCH /reviews/:reviewId/issue-resolution` — `{ action: 'confirm' | 'dispute' }` — reviewer only
- `[WEB]` Owner dashboard: "Mark as Resolved" button per review

### 3.12 @Mention in Comments `[MED]`

- `[DB]` Add `mentionedUserIds String[] @default([])` to `ReviewComment` and `DiscussionComment`
- `[API]` Parse `@username` in comment body → resolve to userId array, emit `mention_notification`
- `[WEB]` Comment input: `@` triggers user typeahead; render `@username` as clickable chip

### 3.13 Review Share Card `[LOW]`

- `[API]` `GET /reviews/:id/share-card` — server-rendered OG-image (entity name, stars, snippet, watermark)
- `[WEB]` Review overflow: "Share Review" → share image + `navigator.share` or copy link

### 3.14 Admin Review Detail Enhancement `[MED]`

- `[ADMIN]` Review detail additions: quality breakdown · fake score · evidence items queue · PII flags · correction requests · community validation breakdown · owner reply + issue resolution · review updates timeline · moderation action history
- `[ADMIN]` Review moderation actions: add `request_edit`, `mark_legal_sensitive`, `redact_personal_information`

---

## Phase 4 — Feed, Community & Discussions *(3–4 weeks)*

**Goal:** Mixed reputation activity feed. Discussions linked to entities/categories/cities. Polls, Q&A in discussions, community identity as a reputation hub.

### Page Roles

```
/feed        = personalized mixed reputation activity feed
/discussions = topic-first, entity/category/city-linked conversations
/community   = reputation hub: leaderboard, contributors, local/category groups
```

### 4.1 Mixed Activity Feed — FeedItem Model `[BLOCKER]`

- `[DB]` New models:
  ```prisma
  model FeedItem {
    id           String   @id @default(uuid()) @db.Uuid
    itemType     String   @map("item_type") @db.VarChar(40)
    // review_created|discussion_created|owner_replied|entity_claimed|entity_verified
    // review_trending|user_badge_earned|community_alert|issue_resolved|campaign_started
    // owner_post_published|entity_question_answered
    actorUserId  String?  @map("actor_user_id") @db.Uuid
    entityId     String?  @map("entity_id") @db.Uuid
    reviewId     String?  @map("review_id") @db.Uuid
    discussionId String?  @map("discussion_id") @db.Uuid
    categoryId   String?  @map("category_id") @db.Uuid
    cityId       String?  @map("city_id") @db.Uuid
    payloadJson  Json     @map("payload_json")
    rankingScore Decimal  @default(0) @db.Decimal(6,2)
    visibility   String   @default("public") @db.VarChar(20)
    createdAt    DateTime @default(now()) @map("created_at")
    expiresAt    DateTime? @map("expires_at")
    @@index([itemType, createdAt(sort: Desc)])
    @@index([entityId, itemType])
    @@index([cityId, itemType])
    @@map("feed_items")
  }
  model FeedHide {
    id        String   @id @default(uuid()) @db.Uuid
    userId    String   @map("user_id") @db.Uuid
    refType   String   @map("ref_type") @db.VarChar(30)
    refId     String   @map("ref_id") @db.Uuid
    createdAt DateTime @default(now()) @map("created_at")
    @@unique([userId, refType, refId])
    @@map("feed_hides")
  }
  ```
- `[API]` `GET /feed` · `GET /feed/me` — query `FeedItem`, personalize by follow graph, exclude `FeedHide`
- Tabs: `for_you | following | nearby | trending | latest | verified`

### 4.2 Feed Cards by Item Type `[BLOCKER]`

- `[WEB]` Per `itemType` card components, including: `owner_post_published` → "Owner posted an update at [Entity]" card; `entity_question_answered` → "[Owner] answered a question at [Entity]" card

### 4.3 Discussion Entity/Category/City Linking `[BLOCKER]`

- `[DB]` Add to `DiscussionPost`:
  ```prisma
  discussionType    String   @default("general") @db.VarChar(30)
  // general|question|complaint_discussion|local_alert|entity_discussion|category_discussion|poll
  entityId          String?  @map("entity_id") @db.Uuid
  categoryId        String?  @map("category_id") @db.Uuid
  cityId            String?  @map("city_id") @db.Uuid
  reviewId          String?  @map("review_id") @db.Uuid
  tagsJson          Json?    @map("tags_json")
  editedAt          DateTime? @map("edited_at")
  resolvedAt        DateTime? @map("resolved_at")
  resolvedCommentId String?   @map("resolved_comment_id") @db.Uuid
  ```
- `[API]` `POST /discussions` — accept all new fields
- `[API]` `GET /entities/:id/discussions` — entity-linked discussions
- `[WEB]` Discussion create: "Link to entity/category/city" typeahead; discussion cards: linked entity chip

### 4.4 Discussion Polls `[HIGH]`

- `[DB]` New models:
  ```prisma
  model DiscussionPoll {
    id           String   @id @default(uuid()) @db.Uuid
    discussionId String   @unique @map("discussion_id") @db.Uuid
    question     String   @db.VarChar(300)
    endsAt       DateTime? @map("ends_at")
    createdAt    DateTime  @default(now()) @map("created_at")
    options      DiscussionPollOption[]
    votes        DiscussionPollVote[]
    @@map("discussion_polls")
  }
  model DiscussionPollOption {
    id       String @id @default(uuid()) @db.Uuid
    pollId   String @map("poll_id") @db.Uuid
    label    String @db.VarChar(200)
    position Int    @default(0)
    @@map("discussion_poll_options")
  }
  model DiscussionPollVote {
    id        String   @id @default(uuid()) @db.Uuid
    pollId    String   @map("poll_id") @db.Uuid
    optionId  String   @map("option_id") @db.Uuid
    userId    String   @map("user_id") @db.Uuid
    createdAt DateTime @default(now()) @map("created_at")
    @@unique([pollId, userId])
    @@map("discussion_poll_votes")
  }
  ```
- `[API]` `POST /discussions` — accept optional `poll: { question, options[], endsAt? }`
- `[API]` `POST /discussions/:id/poll/vote` · `GET /discussions/:id/poll/results`
- `[WEB]` Discussion create: "Add a poll" toggle; discussion card: live vote counts per option

### 4.5 Discussion "Resolved / Answered" Flag `[HIGH]`

- `[API]` `PATCH /discussions/:id/resolve` — `{ resolvedCommentId }` — author only
- `[WEB]` Discussion type `question`: "Mark as Answered" for author; "Answered ✓" chip when resolved; resolved comment highlighted

### 4.6 Discussion Edit, Delete & Search `[HIGH]`

- `[API]` `PATCH /discussions/:id` · `DELETE /discussions/:id` — author only (edit within 24h, soft-delete)
- `[API]` `GET /discussions/search?q=&categoryKey=&entityId=&cityId=&discussionType=`
- `[WEB]` Discussions page: search with debounce; global `/search`: "Discussions" tab

### 4.7 Discussion Comment Threading `[MED]`

- `[DB]` Add `parentCommentId String? @db.Uuid` + self-relation to `DiscussionComment`
- `[WEB]` 1-level nested replies; "Reply" button; collapsed beyond 3

### 4.8 Community Page `[HIGH]`

- `[WEB]` `/community`: Trusted Contributors · Leaderboard · City Communities · Category Communities · Trending Discussions · Weekly Top Reviewers
- Remove review feed cards from community — they belong in `/feed`

### 4.9 Saved Searches with Alerts `[HIGH]`

- `[DB]` New model:
  ```prisma
  model SavedSearch {
    id           String   @id @default(uuid()) @db.Uuid
    userId       String   @map("user_id") @db.Uuid
    label        String?  @db.VarChar(100)
    filtersJson  Json     @map("filters_json")
    alertsEnabled Boolean @default(false) @map("alerts_enabled")
    lastNotifiedAt DateTime? @map("last_notified_at")
    createdAt    DateTime @default(now()) @map("created_at")
    @@index([userId])
    @@map("saved_searches")
  }
  ```
- `[API]` `POST /me/saved-searches` · `GET /me/saved-searches` · `PATCH /me/saved-searches/:id` · `DELETE /me/saved-searches/:id`
- `[API]` Weekly job: for `alertsEnabled` saved searches, run query, notify on new results since `lastNotifiedAt`
- `[WEB]` Search page: "Save this search" button; `/dashboard/my-list` gets a "Saved Searches" tab

### 4.10 Feed Hide & Socket Events `[MED]`

- `[API]` `POST /feed/hide` — `{ refType, refId }` — writes `FeedHide`
- `[WEB]` Feed card overflow: "Not interested in [entity name]" / "Hide posts from this user"
- `[API]` Emit `feed:new_item` with `itemType` discriminator; `[CLIENT]` render correct card per type

### 4.11 Admin Discussion Controls `[MED]`

- `[ADMIN]` Discussion detail: linked entity/category/city, edit status, convert to moderation case
- `[ADMIN]` Discussion list: filter by `discussionType`, `entityId`, `cityId`

---

## Phase 5 — Claims, Owner Dashboard & Team *(3–4 weeks)*

**Goal:** Multi-level claims, owner action center, team management, Q&A, owner posts, invite improvements.

### 5.1 Claim Verification Levels `[BLOCKER]`

| Level | Name | Method |
|---|---|---|
| 0 | Unclaimed | — |
| 1 | Basic Claimed | phone OTP |
| 2 | Business Verified | official email / domain |
| 3 | Document Verified | business registration doc |
| 4 | Admin Verified | manual admin review + docs |
| 5 | Trusted Owner | verified + active response history |

- `[DB]` Add to `EntityClaim`:
  ```prisma
  verificationLevel         Int      @default(1) @map("verification_level") @db.SmallInt
  rejectionReason           String?  @map("rejection_reason") @db.VarChar(500)
  resubmissionAllowed       Boolean  @default(false) @map("resubmission_allowed")
  expiresAt                 DateTime? @map("expires_at")
  revokedReason             String?  @map("revoked_reason") @db.VarChar(500)
  transferRequestedToUserId String?  @map("transfer_requested_to_user_id") @db.Uuid
  ```
- `[API]` Multi-step claim wizard: `POST /entities/:id/claims` — `{ verificationMethod: 'phone_otp' | 'business_email' | 'document_upload' }`
- `[API]` `POST /entities/:id/claims/:claimId/resubmit`
- `[WEB]` Claim flow: choose method → verify → confirmation + verification tier ladder showing next steps to advance
- `[ADMIN]` Claim detail: verification method, submitted docs, existing owners, history; approve/reject with reason; `resubmissionAllowed` toggle

### 5.2 Owner Team Management `[HIGH]`

Required for clinics, schools, companies, and agencies:

- `[DB]` New model:
  ```prisma
  model OwnerTeamMember {
    id          String   @id @default(uuid()) @db.Uuid
    entityId    String   @map("entity_id") @db.Uuid
    userId      String   @map("user_id") @db.Uuid
    role        String   @db.VarChar(30)
    // owner|manager|support_agent|analyst
    permissions String[] @default([])
    // reply_reviews|update_profile|invite_reviews|export_analytics|manage_team
    status      String   @default("active") @db.VarChar(20)
    invitedById String?  @map("invited_by_id") @db.Uuid
    createdAt   DateTime @default(now()) @map("created_at")
    @@unique([entityId, userId])
    @@index([entityId])
    @@map("owner_team_members")
  }
  ```
- `[API]` `POST /owner/entities/:id/team` — `{ email, role, permissions[] }` — invite by email
- `[API]` `GET /owner/entities/:id/team` · `PATCH /owner/entities/:id/team/:memberId` · `DELETE /owner/entities/:id/team/:memberId`
- `[API]` All owner-facing mutations: check `OwnerTeamMember.permissions` for caller
- `[API]` Audit log: record which team member performed each action (reply, edit, export)
- `[WEB]` `/owner/entities/[id]/team` — team management page: invite form, member list, role editor, permission matrix
- `[ADMIN]` Entity detail: team members tab

### 5.3 Owner Route Restructure `[HIGH]`

```
/owner/entities                    → list of owned entities
/owner/entities/[id]               → action center + KPIs
/owner/entities/[id]/reviews       → review management
/owner/entities/[id]/analytics     → analytics
/owner/entities/[id]/profile       → edit entity profile
/owner/entities/[id]/invites       → review invites
/owner/entities/[id]/team          → team management
/owner/entities/[id]/verification  → claim status + tier ladder
/owner/entities/[id]/posts         → owner posts
/owner/entities/[id]/qa            → Q&A queue
```

- `[WEB]` Redirect `/entities/[id]/owner-dashboard` → `/owner/entities/[id]` (301)

### 5.4 Owner Action Center `[HIGH]`

- `[API]` `GET /owner/entities/:id/action-center`:
  ```ts
  {
    unrepliedReviews: number;
    negativeUnreplied: number;
    unansweredQuestions: number;
    profileCompletionPct: number;
    pendingVerificationDocs: number;
    newReviewsThisWeek: number;
    trustScoreDelta7d: number;
    unresolvedComplaints: number;
    pendingCorrectionRequests: number;
    inviteConversionsThisMonth: number;
  }
  ```
- `[WEB]` Owner dashboard home: Action Center card with deep-links per item

### 5.5 Owner KPIs `[HIGH]`

- `[WEB]` KPI grid: Avg Rating · Trust Score · Total Reviews · New This Month · Negative Reviews · Unanswered Reviews · Response Rate · Avg Response Time · Resolved Complaints · Follower Count · Profile Views · Search Appearances
- `[WEB]` Trust score + accountability score sparklines (last 30 days)
- `[WEB]` Benchmarking card: "How you compare to similar entities in [city]" (from Phase 15 benchmark API)

### 5.6 Owner Posts / Announcements `[HIGH]`

- `[DB]` New model:
  ```prisma
  model OwnerPost {
    id           String    @id @default(uuid()) @db.Uuid
    entityId     String    @map("entity_id") @db.Uuid
    authorUserId String    @map("author_user_id") @db.Uuid
    postType     String    @default("update") @map("post_type") @db.VarChar(30)
    // update|announcement|offer|response_to_feedback|hours_change|closure_notice
    title        String?   @db.VarChar(200)
    body         String    @db.Text
    imageUrl     String?   @map("image_url") @db.VarChar(500)
    ctaLabel     String?   @map("cta_label") @db.VarChar(50)
    ctaUrl       String?   @map("cta_url") @db.VarChar(500)
    status       String    @default("published") @db.VarChar(20)
    publishedAt  DateTime? @map("published_at")
    expiresAt    DateTime? @map("expires_at")
    createdAt    DateTime  @default(now()) @map("created_at")
    entity       Entity    @relation(fields: [entityId], references: [id])
    @@index([entityId, status, publishedAt(sort: Desc)])
    @@map("owner_posts")
  }
  ```
- `[API]` `POST /owner/entities/:id/posts` · `GET /owner/entities/:id/posts` · `PATCH` · `DELETE`
- `[API]` `GET /entities/:id/owner-posts` — public, returns published non-expired posts
- `[WEB]` Entity page: "Updates from Owner" section showing latest 3 posts with expand
- `[ADMIN]` Entity detail: Owner Posts tab; hide/remove posts that violate guidelines

### 5.7 Entity Q&A `[HIGH]`

- `[DB]` New models:
  ```prisma
  model EntityQuestion {
    id              String   @id @default(uuid()) @db.Uuid
    entityId        String   @map("entity_id") @db.Uuid
    askedByUserId   String?  @map("asked_by_user_id") @db.Uuid
    questionText    String   @db.Text
    isAnonymous     Boolean  @default(false) @map("is_anonymous")
    status          String   @default("open") @db.VarChar(20)
    ownerAnswerId   String?  @map("owner_answer_id") @db.Uuid
    upvoteCount     Int      @default(0) @map("upvote_count")
    createdAt       DateTime @default(now()) @map("created_at")
    answers         EntityAnswer[]
    @@index([entityId, status])
    @@map("entity_questions")
  }
  model EntityAnswer {
    id               String   @id @default(uuid()) @db.Uuid
    questionId       String   @map("question_id") @db.Uuid
    answeredByUserId String   @map("answered_by_user_id") @db.Uuid
    isOwnerAnswer    Boolean  @default(false) @map("is_owner_answer")
    body             String   @db.Text
    helpfulVotes     Int      @default(0) @map("helpful_votes")
    createdAt        DateTime @default(now()) @map("created_at")
    @@map("entity_answers")
  }
  ```
- `[API]` `POST /entities/:id/questions` · `GET /entities/:id/questions` · `DELETE /entities/:id/questions/:questionId`
- `[API]` `POST /entities/:id/questions/:questionId/answers` · `POST /entities/:id/questions/:questionId/upvote`
- `[API]` On new question → emit `new_entity_question` notification to entity owners
- `[API]` On owner answer → emit `question_answered` to question asker
- `[WEB]` Entity page: "Q&A" tab — ask question CTA, list sorted by upvotes, owner answers highlighted + pinned
- `[WEB]` Q&A contributes to JSON-LD `FAQPage` schema (Phase 9)
- `[WEB]` Owner dashboard: `/owner/entities/[id]/qa` — unanswered questions queue
- `[ADMIN]` Q&A moderation: hide/remove inappropriate questions or answers

### 5.8 Claim Dispute & Transfer `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ClaimDispute {
    id               String    @id @default(uuid()) @db.Uuid
    entityId         String    @map("entity_id") @db.Uuid
    reportedByUserId String    @map("reported_by_user_id") @db.Uuid
    reason           String    @db.VarChar(500)
    evidenceUrls     String[]  @default([]) @map("evidence_urls")
    status           String    @default("open") @db.VarChar(20)
    resolvedBy       String?   @map("resolved_by") @db.Uuid
    adminNotes       String?   @map("admin_notes") @db.Text
    createdAt        DateTime  @default(now()) @map("created_at")
    @@map("claim_disputes")
  }
  ```
- `[API]` `POST /entities/:id/claims/:claimId/dispute` · `POST /entities/:id/claims/:claimId/transfer`
- `[WEB]` Entity page: "Report incorrect ownership" option
- `[ADMIN]` Claim disputes queue at `/admin/claims/disputes`

### 5.9 Owner Review Management `[MED]`

- `[WEB]` Owner reviews tab filters: rating, unanswered, negative, resolved, has evidence, date range
- `[WEB]` Review row actions: Reply · Use Template · Mark Resolved · Request Correction
- `[WEB]` Template auto-suggest based on rating: 1–2 stars → negative templates first; 5 stars → positive first

### 5.10 Review Invite Enhancement `[MED]`

- `[API]` `POST /entities/:id/invites` — accept `maxUses?`, `expiresAt?`, `label?`, `channel?`
- `[WEB]` Invites page: per-invite stats (opens, conversions, status, expiry); creation form with all fields
- `[WEB]` QR code (`qrcode` npm), WhatsApp share link, copy button

### 5.11 Watchlist Alerts `[MED]`

- `[DB]` New model:
  ```prisma
  model WatchlistAlert {
    id              String    @id @default(uuid()) @db.Uuid
    userId          String    @map("user_id") @db.Uuid
    entityId        String    @map("entity_id") @db.Uuid
    alertType       String    @map("alert_type") @db.VarChar(50)
    // trust_score_drop|new_negative_review|owner_reply|status_change|new_complaint
    thresholdValue  Decimal?  @map("threshold_value") @db.Decimal(6,2)
    isActive        Boolean   @default(true) @map("is_active")
    lastTriggeredAt DateTime? @map("last_triggered_at")
    createdAt       DateTime  @default(now()) @map("created_at")
    @@unique([userId, entityId, alertType])
    @@map("watchlist_alerts")
  }
  ```
- `[API]` `POST /me/watchlist-alerts` · `GET /me/watchlist-alerts` · `DELETE /me/watchlist-alerts/:id`
- `[API]` Background job: evaluate triggers on entity trust recalc + new review + status change
- `[WEB]` Entity page: "Set Alert" in follow/save dropdown; `/dashboard/my-list` → Watchlist tab

---

## Phase 6 — Reputation, Streaks, Badges & Notifications *(3–4 weeks)*

**Goal:** Unified reputation layer. Streaks meaningful only when connected to quality actions, helpful votes, validations, and badges. Notifications controlled and actionable.

*(Merges original Phase 6 + Phase 7)*

### 6.1 Streak Quality Weighting `[HIGH]`

- `[API]` New quality `activityType` values: `review_with_evidence` (3×), `community_validation` (2×), `constructive_comment` (1×, body ≥50 chars), `report_confirmed` (2×), `profile_completed` (one-time 5×), `detailed_review` (2×, quality ≥0.7)
- Reduce points for `feed_visit` and `active_time` — passive signals
- `[API]` `activityType: 'share'` eligible only when linked to entity/review/discussion (not generic)

### 6.2 Streak Shield / Freeze `[HIGH]`

- `[DB]` Add to `ReviewStreak`: `shieldCount Int @default(0)`, `shieldUsedAt DateTime?`
- `[API]` Auto-consume shield before resetting streak; auto-award at 7-day and 30-day milestones
- `[WEB]` Streaks dashboard: shield count + earn more explanation

### 6.3 Expand Follow Target Types `[HIGH]`

- `[DB]` Update `FollowTargetType` enum: add `city`, `user`, `tag`, `discussion`
- `[API]` `POST /follows` — validate per `targetType`; `GET /me/follows` — grouped by type
- `[API]` `GET /users/:id/followers` · `GET /users/:id/following`
- `[WEB]` City pages: "Follow this city"; tag chips: "Follow this tag"; discussion cards: "Follow discussion"

### 6.4 User Follow — Feed & Notifications `[HIGH]`

- `[API]` `GET /feed/me` — include `FeedItem` from followed users' reviews + discussions
- `[API]` On followed user publish → emit `new_review_on_followed` notification

### 6.5 Follow Recommendations `[HIGH]`

- `[API]` `GET /recommendations/follows` — based on onboarding category + city: top-rated entities, popular reviewers, trending tags
- `[WEB]` Post-onboarding: "Suggested for you" step; empty feed state: follow recommendations widget

### 6.6 User Reputation Score `[HIGH]`

- `[DB]` New model:
  ```prisma
  model UserReputationScore {
    id                     String   @id @default(uuid()) @db.Uuid
    userId                 String   @unique @map("user_id") @db.Uuid
    publishedReviews       Int      @default(0) @map("published_reviews")
    helpfulVotesReceived   Int      @default(0) @map("helpful_votes_received")
    evidenceBackedReviews  Int      @default(0) @map("evidence_backed_reviews")
    communityConfirmations Int      @default(0) @map("community_confirmations")
    acceptedReports        Int      @default(0) @map("accepted_reports")
    resolvedIssues         Int      @default(0) @map("resolved_issues")
    removedReviews         Int      @default(0) @map("removed_reviews")
    confirmedSpam          Int      @default(0) @map("confirmed_spam")
    behaviorTrustScore     Decimal  @default(0.5) @db.Decimal(3,2)
    totalScore             Int      @default(0) @map("total_score")
    recalculatedAt         DateTime @default(now()) @map("recalculated_at")
    @@map("user_reputation_scores")
  }
  ```
- Formula: `publishedReviews + helpfulVotesReceived + (evidenceBackedReviews×2) + communityConfirmations + (acceptedReports×2) + resolvedIssues - (removedReviews×3) - (confirmedSpam×5)`
- `[API]` `GET /users/:id/reputation` — public summary

### 6.7 Reputation Dashboard Page `[HIGH]`

- `[WEB]` New route `/dashboard/reputation` — merges badges + streaks + reputation:
  - Current Streak · Longest Streak · Shield Count · Contribution Score
  - Badge Grid · Global Rank · Following Rank · Next Milestone progress
  - Reputation event timeline
  - Streak milestone celebration: confetti + "You earned a badge!" modal
- `[WEB]` Redirect `/dashboard/badges` and `/dashboard/streaks` → `/dashboard/reputation`

### 6.8 Notification Preferences `[HIGH]`

- `[DB]` New model:
  ```prisma
  model NotificationPreference {
    id        String   @id @default(uuid()) @db.Uuid
    userId    String   @unique @map("user_id") @db.Uuid
    prefsJson Json     @map("prefs_json")
    // per NotificationType: { enabled: boolean, channels: ('in_app'|'email'|'push')[] }
    updatedAt DateTime @updatedAt @map("updated_at")
    @@map("notification_preferences")
  }
  ```
- `[API]` `GET /me/notification-preferences` · `PATCH /me/notification-preferences`
- `[API]` All notification emit paths: check preferences before sending

### 6.9 Web Push Notifications `[HIGH]`

- `[DB]` Add to `UserDevice`: `pushSubscriptionJson Json?`, `pushEnabled Boolean @default(false)`
- `[API]` `POST /me/push-subscription` · `DELETE /me/push-subscription`
- `[API]` All notification emit paths: send Web Push via `web-push` when subscription active + prefs allow
- `[WEB]` Push permission prompt after 2+ minutes of active use post-login (not on first page load)
- Service worker (Phase 10): `push` event handler → show notification with entity name + snippet

### 6.10 Email Notification Templates `[HIGH]`

- `[DB]` New model:
  ```prisma
  model EmailTemplate {
    id          String   @id @default(uuid()) @db.Uuid
    templateKey String   @unique @map("template_key") @db.VarChar(100)
    subject     String   @db.VarChar(300)
    htmlBody    String   @db.Text
    textBody    String   @db.Text
    variables   String[] @default([])
    isActive    Boolean  @default(true) @map("is_active")
    updatedAt   DateTime @updatedAt @map("updated_at")
    @@map("email_templates")
  }
  ```
- Template keys: `review_reply_received`, `claim_approved`, `claim_rejected`, `new_helpful_vote`, `badge_earned`, `mention_in_comment`, `weekly_recap`, `watchlist_alert`, `account_suspended`, `correction_request`
- `[API]` Email service: resolve template by key, interpolate variables, send via transactional provider (Resend/SES)
- `[ADMIN]` `/admin/email-templates` — edit subject + body, preview with test data, send test email

### 6.11 Notification UI Improvements `[HIGH]`

- `[WEB]` "Mark all as read"; filter by type (reviews, discussions, claims, badges, system)
- `[WEB]` Notification grouping: "3 people voted your review helpful"
- `[WEB]` `/dashboard/notification-settings` — notification preferences page

### 6.12 My List Dashboard Page `[MED]`

- `[WEB]` New route `/dashboard/my-list` with tabs: Saved Entities · Followed Entities · Followed Categories · Followed Cities · Followed Users · Followed Tags · Followed Discussions · Saved Searches · Watchlist Alerts
- `[WEB]` Redirect `/dashboard/saved` and `/dashboard/follows` → `/dashboard/my-list`

### 6.13 Weekly Digest `[MED]`

- `[API]` Weekly job: emit `weekly_recap` notification with new reviews on followed entities, trust score changes, owner replies, top discussions, streak/badge updates
- `[WEB]` `weekly_recap` renders as a digest card in notifications

---

## Phase 7 — Search, Discovery & Comparison *(2–3 weeks)*

**Goal:** Make search the primary acquisition and re-engagement channel. Autocomplete, advanced filters, comparison, zero-result conversion, search analytics.

### 7.1 Entity Autocomplete API `[BLOCKER]`

- `[API]` `GET /search/entities/autocomplete?q=&cityId?&categoryKey?` — top 5 suggestions with logo, category, city, rating — optimized for <100ms
- `[WEB]` Global search bar: inline dropdown autocomplete with keyboard navigation
- `[WEB]` Review form entity selector: uses autocomplete

### 7.2 Advanced Search Filters `[HIGH]`

- `[API]` Extend `GET /search/entities` params: `verified=true`, `hasMedia=true`, `ownerResponsive=true`, `openNow=true`, `minReviewCount=N`, `maxDistance=N&lat=X&lng=Y`
- `[WEB]` Search page: "Advanced filters" expandable panel
- `[WEB]` Optional map view mode showing entity pins per locality

### 7.3 Search by Phone Number `[HIGH]`

- `[API]` `GET /search/entities?phone=<normalized>` — look up entity by phone (E.164)
- `[WEB]` Search page: "Search by phone number" tab

### 7.4 Related Searches `[HIGH]`

- `[API]` `GET /search/related?q=&categoryKey=&cityId=` — other queries users made after this query; other categories explored
- `[WEB]` Search results: "People also searched for" chip row
- `[WEB]` Zero-results page: "Try these related searches" + "Be the first to add an entity here" → pre-filled entity create form

### 7.5 Search Analytics `[HIGH]`

- `[DB]` New model:
  ```prisma
  model SearchQueryLog {
    id              String   @id @default(uuid()) @db.Uuid
    userId          String?  @map("user_id") @db.Uuid
    queryText       String?  @map("query_text") @db.VarChar(300)
    categoryKey     String?  @map("category_key") @db.VarChar(100)
    cityId          String?  @map("city_id") @db.Uuid
    resultCount     Int      @default(0) @map("result_count")
    clickedEntityId String?  @map("clicked_entity_id") @db.Uuid
    source          String?  @db.VarChar(30) // zero_result_create|regular
    createdAt       DateTime @default(now()) @map("created_at")
    @@index([queryText])
    @@index([resultCount, createdAt(sort: Desc)])
    @@map("search_query_logs")
  }
  ```
- `[API]` `GET /search/entities` — write `SearchQueryLog` fire-and-forget after query
- `[API]` `POST /analytics/search/click` — `{ queryLogId, entityId }`
- `[ADMIN]` `/admin/search-analytics`: top zero-result queries (entity creation opportunities), top queries, click-through rate per query

### 7.6 Entity Comparison `[HIGH]`

- `[API]` `GET /entities/compare?ids=id1,id2,id3` — comparison payload for up to 3 entities
- `[WEB]` `/compare?entities=id1,id2` — side-by-side: rating, trust score, review count, response rate, resolution rate, top tags
- `[WEB]` Entity page: "Compare with similar" CTA; search results: multi-select + "Compare selected"

### 7.7 Nearby Entities `[MED]`

- `[API]` `GET /entities/nearby?lat=&lng=&radius=&categoryKey?` — sorted by distance then trust score
- `[WEB]` Home page: "Near you" section (browser geolocation prompt)

### 7.8 Zero-Result → Entity Creation `[MED]`

- `[WEB]` Zero-results page: "Add [query] as a new entity" → pre-fills entity create form
- `[API]` Tag entity created from zero-result search with `source = 'zero_result_search'` — feeds admin growth dashboard

---

## Phase 8 — Moderation, Trust Safety & Legal Ops *(2–3 weeks)*

**Goal:** Professional moderation queues, reason codes, evidence redaction, review bombing incidents, user risk scoring, appeal flow.

### 8.1 Moderation Route Fix `[BLOCKER]`

- `[WEB]` Move `/community/moderation` → admin portal only
- `[WEB]` Remove moderation from community nav; accessible only via header icon for `admin|super_admin|moderator`

### 8.2 Review Bombing Incident Management `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ReviewBombingIncident {
    id             String    @id @default(uuid()) @db.Uuid
    entityId       String    @map("entity_id") @db.Uuid
    detectedAt     DateTime  @default(now()) @map("detected_at")
    triggerType    String    @map("trigger_type") @db.VarChar(50)
    // velocity_spike|collusion_detected|mass_same_ip|new_account_burst
    affectedReviewIds String[] @map("affected_review_ids")
    status         String    @default("open") @db.VarChar(20)
    // open|under_review|resolved|false_positive
    resolvedAt     DateTime? @map("resolved_at")
    resolvedById   String?   @map("resolved_by_id") @db.Uuid
    adminNotes     String?   @map("admin_notes") @db.Text
    @@index([entityId, status])
    @@map("review_bombing_incidents")
  }
  ```
- `[API]` On review save: if `reviewCountInLast24h > avg_daily_reviews × 3` → create `ReviewBombingIncident`; temporarily reduce trust weight of reviews in the spike window
- `[API]` On incident creation: emit `community_alert` `FeedItem` if severity is high — "Unusual review activity detected on [Entity]"
- `[API]` Bulk hold: `POST /admin/incidents/:id/hold-reviews` — sets affected reviews to `under_verification`
- `[API]` Bulk release: `POST /admin/incidents/:id/release-reviews`
- `[ADMIN]` Moderation queue: "Review Bombing Incidents" sub-queue
- `[ADMIN]` Incident detail: affected review list with bulk hold/unhold/remove; resolve with reason code

### 8.3 Moderation Queues `[HIGH]`

- `[API]` `GET /admin/moderation/queues` — queue count summary
- `[API]` `GET /admin/moderation/cases?queue=reported_reviews|reported_discussions|reported_comments|duplicate_entities|claim_disputes|owner_abuse|suspicious_users|legal_sensitive|auto_flagged|bombing_incidents|correction_requests`
- `[ADMIN]` Moderation home: queue cards with counts
- `[ADMIN]` Bulk select + action (hide all selected reviews, etc.)

### 8.4 Reason Codes & Action History `[HIGH]`

- `[DB]` Add `reasonCode String? @db.VarChar(50)` to `ModerationAction`
  - Codes: `spam | fake_review | harassment | private_information | defamation_risk | wrong_entity | duplicate_content | conflict_of_interest | manipulated_votes | irrelevant_content | legal_sensitive | review_bombing | pii_leaked | competitor_mention`
- `[ADMIN]` Resolve case modal: required reason code dropdown + optional notes
- `[ADMIN]` Case detail: full `ModerationAction` timeline with actor, action type, reason code, notes, state diff
- `[ADMIN]` User detail: moderation cases involving this user's content

### 8.5 Policy Engine `[HIGH]`

A central service that determines eligibility for key platform actions — prevents scattered logic across controllers:

- `[API]` `PolicyService` (NestJS provider, no DB model): methods include:
  - `canReview(userId, entityId)` → check: not deleted, not banned, review interval, per-day limit, verified if required, phone verified if required
  - `canReply(userId, reviewId)` → check: owns entity, not banned
  - `canClaim(userId, entityId)` → check: not duplicate claimant, phone verified
  - `canVote(userId, reviewId)` → check: not own review, not banned
  - `reviewRequiresVerification(review)` → check: new account, low trust, flagged entity
- All limits configurable via `PlatformConfig` (Phase 0.5)
- `[API]` All relevant controllers use `PolicyService` guard; never duplicate logic inline

### 8.6 Report Escalation `[HIGH]`

- `[API]` `POST /admin/reports/:id/create-moderation-case` — promote report to full moderation case
- `[ADMIN]` Report detail: "Escalate to Moderation Case" button

### 8.7 Duplicate Entity Admin Workflow `[HIGH]`

- `[ADMIN]` Duplicates queue at `/admin/entities/duplicates`
- `[ADMIN]` Side-by-side comparison: name, category, city, phone, address, reviews, claims, followers, trust score
- `[ADMIN]` Actions: Confirm Duplicate · Reject · Merge A into B · Merge B into A
- `[ADMIN]` Legal-sensitive cases: escalation modal with notice template

### 8.8 User-Facing Report Additions `[MED]`

- `[WEB]` Review report: add "Wrong entity", "Private information" options
- `[WEB]` Own hidden review: "Appeal" CTA → sends to moderation queue
- `[WEB]` Entity page: "Report incorrect ownership" option in overflow

### 8.9 Evidence Redaction in Moderation `[MED]`

- `[ADMIN]` Review detail: "Redact sensitive areas" action for public evidence images — uses redacted URL from `EvidenceItem.redactedUrl`
- `[ADMIN]` Mark evidence `private_admin` or `private_owner_on_consent` post-facto

### 8.10 Entity Alias Management `[LOW]`

- `[ADMIN]` Entity detail: Aliases tab — add, edit, delete aliases per `AliasType`

---

## Phase 9 — SEO, Campaigns, Content & Growth *(2–3 weeks)*

**Goal:** Organic traffic through SEO landing pages, schema markup, entity comparison, review invite pages, campaigns aligned to contribution.

### Core Rule
> Growth features must drive entity discovery and review collection, not generic engagement.

### 9.1 City & Category Landing Pages `[HIGH]`

- `[WEB]` `/categories/[categoryKey]` — top-rated, most reviewed, recent reviews, common warning tags, "how to choose" guide, FAQ block
- `[WEB]` `/cities/[citySlug]` — top entities per category in city, recent reviews, trending discussions, claim CTA
- `[WEB]` `/cities/[citySlug]/[categoryKey]` — city + category combo pages (highest SEO value)
- `[API]` `GET /cities/:citySlug` · `GET /cities/:citySlug/:categoryKey`
- Each landing page links internally to top entities, blog articles, and recent discussions in that space

### 9.2 SEO & Structured Data `[HIGH]`

- `[WEB]` Entity pages: JSON-LD `LocalBusiness` + `AggregateRating`
- `[WEB]` Entity Q&A tab content: JSON-LD `FAQPage` (from Phase 5.7)
- `[WEB]` Review pages: JSON-LD `Review`
- `[WEB]` Blog pages: JSON-LD `Article`; wire `seoTitle`/`seoDescription` fields to `next/head`
- `[WEB]` Category/city pages: JSON-LD `Organization` + `BreadcrumbList` + `FAQPage`
- `[WEB]` `/robots.txt` and `/sitemap.xml` — dynamic, includes entity pages, blog slugs, city/category pages
- `[WEB]` All public pages: Open Graph + Twitter Card meta

### 9.3 Entity Comparison SEO Pages `[HIGH]`

- `[WEB]` `/compare/[entityA]/vs/[entityB]` — side-by-side comparison page with full schema markup
- `[WEB]` These pages are auto-indexable for "[Entity A] vs [Entity B]" search queries

### 9.4 Blog ↔ Entity Internal Linking `[MED]`

- `[DB]` Add to `Blog`: `linkedEntityIds String[] @default([]) @map("linked_entity_ids")`
- `[ADMIN]` Blog editor: "Link related entities" field
- `[WEB]` Blog post: shows linked entity cards at the bottom → drives entity page traffic

### 9.5 Campaign Quality Rules `[MED]`

- `[API]` Campaign create DTO: add `requiredReviewType?` and `requiredCategoryKey?` — campaigns must target specific contribution types
- Campaign examples: "Review Karachi clinics this week", "Best schools drive", "Report duplicate entities"
- `[WEB]` Campaign page: show exactly what type of contribution is needed

### 9.6 Review Invite Landing Pages `[MED]`

- `[WEB]` `/invite/[token]` — public landing page showing entity info + review CTA: "You've been invited to review [Entity Name]"
- `[WEB]` Page accessible without login; login/register required to submit review; redirect back after auth

### 9.7 Admin Growth Dashboard `[MED]`

- `[API]` Extend `GET /admin/dashboard` with: new users/reviews/entities (daily/weekly/monthly), claimed entities, invite conversions, SEO landing page visits, zero-result search rate, top categories/cities by volume
- `[ADMIN]` Growth metrics section with period selector

---

## Phase 10 — PWA, Performance & Observability *(1–2 weeks)*

### 10.1 PWA `[HIGH]`

- `[WEB]` `manifest.json`: name, icons, theme color, `display: standalone`
- `[WEB]` Service worker: cache static assets, offline fallback page, Web Push handler
- `[WEB]` "Add to Home Screen" prompt after 3rd visit

### 10.2 Image Optimization `[HIGH]`

- `[WEB]` All entity logos/covers/avatars: `next/image` with `priority` on above-fold
- `[WEB]` Evidence gallery: lazy-load with blur placeholder
- `[API]` Upload service: enforce 5MB max, auto-compress via `sharp`

### 10.3 Bundle Performance `[MED]`

- `[WEB]` Category extension forms: `next/dynamic` — load only when category selected
- `[WEB]` Feed/discussion infinite scroll: virtualize with `@tanstack/react-virtual` for lists >50 items

### 10.4 Mobile-Specific UX `[MED]`

- `[WEB]` Bottom sheets for: review create, entity filters, report dialog, share sheet (not modals on mobile)
- `[WEB]` Swipe-to-dismiss on notifications
- `[WEB]` Pull-to-refresh on feeds, entity reviews, discussion list

### 10.5 Frontend Observability `[MED]`

- `[CLIENT]` Structured error logging ring buffer: log `{ endpoint, statusCode, requestId, timestamp }` for last 50 client-side errors; "Copy debug info" button in dev mode
- `[API]` Slow endpoint dashboard: log response time percentiles per endpoint
- `[API]` `GET /health/deep` (admin-only): per-service health check (DB, Redis, upload service)

---

## Phase 11 — Auth Extension & OAuth *(1–2 weeks)*

### 11.1 Google OAuth `[HIGH]`

- `[API]` `POST /auth/google` — verify idToken with Google SDK, upsert user; if no `cityId` or preferences → `requiresOnboarding: true`
- `[WEB]` Login + register: "Continue with Google" button

### 11.2 Apple OAuth `[MED]`

- `[API]` `POST /auth/apple` — `{ identityToken, authorizationCode }`
- `[WEB]` Login + register: "Continue with Apple"

### 11.3 Account Linking `[MED]`

- `[API]` `POST /me/link/google` · `POST /me/link/apple`
- `[WEB]` Profile settings: "Linked accounts" section

---

## Phase 12 — Admin Portal Final Polish *(1 week)*

*All functional admin work should be completed in each phase. Phase 12 is polish only.*

- `[ADMIN]` Verify all cross-links between modules are in place
- `[ADMIN]` Audit trail cross-linking: AuditLog expandable section at bottom of every detail page (entity, user, review, claim)
- `[ADMIN]` `POST /admin/trust/recalculate/:userId` + `GET /admin/trust/:userId/history` — wire to user detail
- `[ADMIN]` `POST /admin/badges/recalculate-user/:userId` + `POST /admin/badges/recalculate-entity/:entityId` — wire to detail pages
- `[ADMIN]` Consistency pass: all destructive actions (remove, ban, merge, revoke) require confirmation modal with consequence description
- `[ADMIN]` All moderation/claims/legal-sensitive actions require reason code

---

## Phase 13 — Owner Communication Center *(2–3 weeks)*

**Goal:** Give owners a professional communication layer beyond review replies. Reduce owner reliance on external channels.

### 13.1 Review Removal Request `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ReviewRemovalRequest {
    id                String    @id @default(uuid()) @db.Uuid
    reviewId          String    @map("review_id") @db.Uuid
    requestedByUserId String    @map("requested_by_user_id") @db.Uuid
    reason            String    @db.VarChar(500)
    evidenceUrls      String[]  @default([]) @map("evidence_urls")
    status            String    @default("pending") @db.VarChar(20)
    adminNotes        String?   @map("admin_notes") @db.Text
    resolvedAt        DateTime? @map("resolved_at")
    createdAt         DateTime  @default(now()) @map("created_at")
    @@unique([reviewId, requestedByUserId])
    @@map("review_removal_requests")
  }
  ```
- `[API]` `POST /reviews/:id/removal-request` — owner only; `GET /admin/reviews/removal-requests`; `PATCH /admin/reviews/removal-requests/:id`
- `[WEB]` Owner review management: "Request Removal" with reason + evidence upload
- `[ADMIN]` Queue at `/admin/reviews/removal-requests`

### 13.2 Bulk Reply Templates `[MED]`

- `[API]` `POST /owner/entities/:id/replies/bulk` — `{ rows: [{ reviewId, templateId }][] }` — saved as drafts pending owner confirmation
- `[WEB]` Owner reviews tab: bulk select → "Apply template reply to selected" → confirm before publishing

### 13.3 Personal Contribution Impact Dashboard `[HIGH]`

- `[API]` `GET /me/impact-summary`: reviews published · total helpful votes · entities reviewed · owner replies received · issues resolved · community validations · reports confirmed · estimated people helped (heuristic: review view count sum) · longest streak · current badge level
- `[WEB]` New `/dashboard/impact` page — visual impact summary, shareable impact card (server-rendered via `sharp`, shareable to LinkedIn/WhatsApp)

### 13.4 Owner Profile Verification Tier Dashboard `[HIGH]`

- `[WEB]` Entity Trust & Verification tab: step-by-step verification ladder with current level + what's needed to advance to next tier
- `[API]` `GET /entities/:id/trust-summary` — include `verificationTierLabel` and `verificationTierNext`

---

## Phase 14 — Trust Intelligence Layer *(3–4 weeks)*

**Goal:** Pattern-aware trust detection using PostgreSQL + scheduled jobs. No external ML pipeline required for v1.

### Core Principle
> All signals are derived from existing data using scheduled jobs, PostgreSQL analytics queries, and threshold rules. ML can replace these jobs in a later phase once data volume justifies it.

### 14.1 Reviewer Network Analysis (Collusion Detection) `[HIGH]`

- `[DB]` New model:
  ```prisma
  model SuspiciousReviewerCluster {
    id          String    @id @default(uuid()) @db.Uuid
    entityId    String    @map("entity_id") @db.Uuid
    userIds     String[]  @map("user_ids")
    clusterType String    @map("cluster_type") @db.VarChar(50)
    // same_device|same_ip_subnet|same_registration_hour|coordinated_timing
    confidence  Decimal   @default(0) @db.Decimal(3,2)
    detectedAt  DateTime  @default(now()) @map("detected_at")
    resolvedAt  DateTime? @map("resolved_at")
    @@index([entityId, resolvedAt])
    @@map("suspicious_reviewer_clusters")
  }
  ```
- `[API]` Weekly job: detect users who share `fingerprintHash` OR registered within same 24h window AND reviewed same entity; create cluster when ≥3 users match; auto-create `ReviewFlag.flagType = 'coordinated_pattern'` on their reviews
- `[ADMIN]` `/admin/trust/clusters` — list detected clusters; "Confirm Coordinated" → bulk set to `under_verification` and reduce entity trust score; "Mark False Positive"

### 14.2 Trust Score Velocity Alerts `[HIGH]`

- `[API]` Job (every 6h): compare entity `trustScore` against 7-day rolling average
  - Drop >15% in 24h → create `ModerationCase` type `trust_score_spike_negative`
  - Gain >20% in 24h (artificial boost) → create `ModerationCase` type `trust_score_spike_positive`
- `[ADMIN]` Entity detail: trust score chart shows velocity anomaly markers; "Trust Velocity Alerts" sub-queue

### 14.3 Contributor Behavior Trust Score `[HIGH]`

- `[DB]` Add to `UserReputationScore`:
  ```prisma
  reviewRejectionRate  Decimal @default(0) @db.Decimal(3,2)
  reportAccuracyRate   Decimal @default(0) @db.Decimal(3,2)
  accountAgeDays       Int     @default(0) @map("account_age_days")
  ```
- Formula: `0.4 × (1 - reviewRejectionRate) + 0.3 × reportAccuracyRate + 0.3 × min(accountAgeDays/365, 1)`
- `[API]` Recalculate on review removed, report confirmed/denied, daily age increment job
- `[WEB]` Reviews from low-trust users shown with "Limited visibility" styling; `behaviorTrustScore` feeds `ReviewQualityScore.reviewerTrustScore`

### 14.4 Entity Category Benchmarking `[HIGH]`

- `[API]` `GET /entities/:id/benchmark`:
  ```ts
  {
    trustScorePercentile: number;
    responseRatePercentile: number;
    reviewCountPercentile: number;
    avgRatingPercentile: number;
    categoryLabel: string;
    peerCount: number;
    yourRankBand: 'top_10'|'top_25'|'top_50'|'bottom_50';
  }
  ```
- `[WEB]` Entity Trust Overview: "Ranks in top X% of [category] in [city]" chip
- `[WEB]` Owner dashboard: "How you compare to similar entities" benchmarking card
- `[API]` `GET /owner/entities/:id/category-insights` — anonymized aggregate stats (no competitor names)

### 14.5 Entity Health Score `[HIGH]`

- `[API]` `GET /entities/:id/health-score`:
  ```ts
  {
    overallHealth: number; // 0-100
    dimensions: {
      contentQuality: number;     // avg review quality score
      ownerEngagement: number;    // response rate + post activity
      communityTrust: number;     // trust score + validation ratio
      profileCompleteness: number;
      recentActivity: number;     // reviews in last 90 days vs benchmark
    };
    trend: 'improving'|'stable'|'declining';
    suggestedActions: string[]; // e.g. "Reply to 3 unanswered reviews", "Add business hours"
  }
  ```
- `[WEB]` Owner dashboard: Entity Health Score card as primary KPI
- `[WEB]` Entity page: simplified health ring (no breakdown exposed publicly)

### 14.6 Review Import Verification `[MED]`

Imported reviews should not carry the same trust weight as user-submitted ones:

- `[DB]` Add to `Review`: `source String @default("user_submitted") @db.VarChar(30)`, `importBatchId String? @db.Uuid @map("import_batch_id")`
- Sources: `user_submitted | admin_imported | invite_submitted | migrated`
- `[API]` Admin import: set `source = 'admin_imported'`, lower initial quality score weight, auto-set `under_verification`
- `[WEB]` Review card: subtle "Imported review" label for imported source until verified by admin or community
- `[ADMIN]` Review list: `source` filter column; bulk verify imported batch

### 14.7 Admin Platform Health Dashboard `[MED]`

- `[API]` `GET /admin/platform-health`: new users/reviews/entities (7d + delta vs prior 7d), claim approval rate, avg moderation resolution hours, auto-flagged review %, trust score coverage, entities with no reviews, top cities/categories by activity, search zero-result rate
- `[ADMIN]` `/admin/platform-health` — executive health view; export as PDF/CSV

---

## Phase 15 — Multilingual & Localization *(2–3 weeks)*

**Goal:** Urdu language support and RTL layout. Critical for Pakistan market penetration beyond urban English-literate users.

### 15.1 i18n Architecture `[BLOCKER]`

- `[WEB]` Add `next-intl` for i18n routing: `/en/*` and `/ur/*`
- `[WEB]` Translation files: `en.json` and `ur.json` for all UI strings
- `[WEB]` Language switcher: persistent toggle in header; store in `localStorage` + user profile
- `[DB]` Add to `User`: `preferredLanguage String @default("en") @db.VarChar(10)`
- `[API]` `PATCH /me` — accept `preferredLanguage`

### 15.2 RTL Layout `[BLOCKER]`

- `[WEB]` Add `dir="rtl"` to `<html>` when language is `ur`
- `[WEB]` Replace all directional `left/right` CSS with logical properties: `margin-inline-start`, `padding-inline-end`, `border-inline-start`
- `[WEB]` Tailwind: `ltr:` and `rtl:` variants for direction-specific styles
- `[WEB]` Add `Noto Nastaliq Urdu` (Google Fonts) to font stack for RTL mode

### 15.3 Bilingual Entity Names & Content `[HIGH]`

- `[WEB]` Entity page: Urdu name beneath English name when `displayNameUr` set (from Phase 2.1)
- `[DB]` Add to `Category`: `labelUr String? @map("label_ur") @db.VarChar(100)`
- `[WEB]` Category display: Urdu label in category picker and cards

### 15.4 Review Language Detection `[MED]`

- `[DB]` Add to `Review`: `languageCode String @default("en") @db.VarChar(10)`
- `[API]` Auto-detect language on save using `franc` npm package
- `[WEB]` Review cards: "اردو" / "English" chip when language ≠ interface language
- `[WEB]` Review filters on entity page: filter by review language

---

## Phase 16 — Insights & Intelligence Dashboard *(2–3 weeks)*

**Goal:** Personalized intelligence for every user type. From passive reading to active insight.

### 16.1 Reviewer Contribution Score Card (Public) `[HIGH]`

- `[WEB]` Public user profile: "Contribution Score Card" section showing:
  - Quality Rating: ratio of evidence-backed + trusted reviews vs total
  - Community Trust: helpful vote ratio, confirmations
  - Consistency: streak history, review frequency
  - Impact: estimated helpful impressions
  - Replaces generic "X reviews posted" with a quality narrative

### 16.2 Owner Category Insights (Anonymous Benchmarking) `[HIGH]`

- `[API]` `GET /owner/entities/:id/category-insights` — anonymized aggregate peer data (no competitor names/IDs):
  ```ts
  { categoryLabel, cityLabel, peerCount, avgTrustScore, avgRating, avgResponseRate, topWarningTagsInCategory, yourRankBand }
  ```
- `[WEB]` Owner dashboard analytics: "Category Insights" section — "In your category in [city], the average trust score is X. You're above average."

### 16.3 Admin Platform Analytics `[HIGH]`

- `[API]` `GET /admin/platform-health` (from Phase 14.7 — wire full analytics here)
- `[ADMIN]` `/admin/platform-health` — review volume trends, user growth, category/city activity matrix, SEO landing page visit data

### 16.4 Entity Timeline — Public Transparency `[MED]`

- `[API]` `GET /entities/:id/timeline` — sanitized public timeline:
  - Entity created · Claimed · Verified · Merged into · Owner changed · Major complaint spike · Trust score event · Admin warning added
- `[WEB]` Entity Trust & Verification tab: public timeline with human-readable labels
- Builds accountability by making entity history visible

### 16.5 Weekly Platform Digest for Admin `[LOW]`

- `[API]` Weekly job: generate admin digest with: review volume, user signups, claim activity, moderation backlog, trust alerts, top entities by activity
- `[ADMIN]` Dashboard: "Weekly digest" card with key changes vs prior week; exportable

---

## New Core Modules

These are **cross-module architectural concerns** that do not belong to a single phase but should be built and owned as dedicated services.

### Module A: Trust Event Engine

Every meaningful platform action should create a `TrustScoreEvent`. Upgrade from DB record to a real product layer:

- `[API]` `TrustEventService`: typed event factory for: `review_created`, `review_verified`, `review_hidden`, `owner_replied`, `issue_resolved`, `entity_claimed`, `claim_revoked`, `duplicate_merged`, `suspicious_cluster_confirmed`, `review_bomb_resolved`
- Each event carries: `entityId`, `weight` (positive/negative), `description`, `effectiveAt`
- `[API]` All relevant services emit trust events through `TrustEventService` (not scattered across modules)
- `[WEB]` Entity Trust & Verification tab: human-readable trust event timeline (from Phase 2.14 — powered by this engine)
- `[ADMIN]` Entity detail: full trust event log

### Module B: Event Bus

All cross-module triggers go through an internal `EventEmitter2` event bus — prevents circular service injection:

- `[API]` Defined typed events: `ReviewCreatedEvent`, `ReviewHiddenEvent`, `ClaimApprovedEvent`, `EntityMergedEvent`, `BadgeEarnedEvent`, `ReviewBombingDetectedEvent`, `EvidenceFlaggedEvent`
- Subscribers: `FeedFanoutSubscriber`, `BadgeCheckSubscriber`, `StreakUpdateSubscriber`, `TrustScoreSubscriber`, `NotificationSubscriber`, `AutoFlagSubscriber`
- Each subscriber is decoupled from the source action module

### Module C: Policy Engine

*(Specified in Phase 8.5 — centralized here for clarity)*

`PolicyService` is the single source of truth for: who can review, who can reply, when review goes under verification, when rate limiting applies. All limits sourced from `PlatformConfig` (Phase 0.5). No policy logic in controllers.

### Module D: Review Source Tracking

*(Specified in Phase 14.6 — own module for tracking provenance)*

All reviews carry: `source` (user_submitted/admin_imported/invite_submitted/migrated), `importBatchId?`, `inviteId?`. Trust weight and quality scoring adjusted by source. Surfaced in admin + public card labels.

---

## Cross-Cutting Concerns

### Architecture Standards

**Backend (NestJS)**
- Controllers: HTTP routing and DTO validation only
- Services: all business logic
- No raw Prisma calls in controllers
- DB transactions for multi-step writes (merge, claim approve, review create + quality score)
- Audit log entries for: claim approve/reject, user suspend/ban, entity merge, review remove, admin content actions
- All new endpoints: Swagger `@ApiOperation` + `@ApiResponse`
- API envelope: `{ success: true, data, timestamp }` / `{ success: false, error: { code, message, details?, requestId? }, timestamp, path }`

**Rate Limiting (enforced by PolicyService + PlatformConfig)**
- Review submission: 3 per user per day globally; 1 per entity per 6 months
- Q&A: 5 questions per user per day
- Evidence upload: 5 files per review
- Invite creation: 100 per entity per month
- All limits configurable without redeploy

**Frontend (Next.js)**
- Loading state hierarchy: `skeleton` (first load) → `spinner overlay` (mutation in progress) → `inline spinner` (background refresh)
- Error boundary hierarchy: Page-level → Section-level → Inline toast
- Optimistic UI: follows, saves, votes, reactions, comment post — NOT optimistic for review submit
- Old routes always redirect, never 404
- Guest read behavior on all discovery pages; protected routes for mutations
- Mobile test standard: 375px width, bottom sheets on mobile (not modals)

**Pagination Standardization**
- All list endpoints support cursor (`nextCursor`) AND offset (`page`/`pageSize`)
- Cursor: feeds, discussions, notifications, comments
- Offset: admin lists, search results, reports
- Standard shape: `{ items: [], pagination: { total?, nextCursor?, page?, pageSize?, hasMore } }`

**Admin Portal**
- Every destructive action requires confirmation modal with consequence description
- All moderation/claims/legal actions require reason code
- Import flows return row-level success/error counts, not just totals

---

## Deferred / De-Scoped Items

| Item | Status | Reason |
|---|---|---|
| AI review summarization | Deferred | First collect structured tags, evidence status, owner replies. Then AI summaries become safe and meaningful. |
| In-app user messaging | Deferred post-10k MAU | Owner Q&A (Phase 5.7) covers 80% of use case without full messaging complexity |
| Native mobile app | Deferred | PWA (Phase 10) buys time; revisit after 10k MAU |
| Advanced salary analytics | Reconsider at 10+ submissions | Histogram per job title is useful at low volume; ship Phase 2.13 sooner |
| Paid owner plans | After free owner utility proven | First prove claim, reply, invite, analytics usage |
| Generic user status posts | Never | Explicitly conflicts with core product decision |
| Complex campaign leaderboards | Deferred | Keep campaigns tied to review contribution; no scoring complexity |
| Poll discussion type | **Now included** | Phase 4.4 — DB model is minimal, tied to entity/category/city discussions |
| PDF monthly owner report | Phase 14 or later | Phase 14.7 generates the data; `puppeteer` is one endpoint after data is ready |

---

## Implementation Tracking Checklist

### Phase 0
- [ ] API client 429/403/5xx/network error handling
- [ ] Request deduplication + global skeleton component
- [ ] Socket reconnect and room rejoin + event deduplicate
- [ ] Optimistic UI for votes/follows/saves/reactions
- [ ] Feed scroll restoration
- [ ] Presigned upload flow + client upload component standard
- [ ] `PlatformConfig` DB model + admin config page
- [ ] Document login response shape (`requiresVerification` branch)
- [ ] Enforce `CommunityValidationType` DTO
- [ ] Show `ReviewQualityScore` on review cards
- [ ] Show `IssueResolution` status on review cards
- [ ] `PATCH /notifications/read-all` wired in web
- [ ] Analytics fire-and-forget + debounce
- [ ] Onboarding re-entry in dashboard
- [ ] Invite create: accept maxUses/expiresAt/label
- [ ] Admin: session error boundary + access denied page
- [ ] Admin: show UserDevice list on user detail
- [ ] `X-Request-ID` on all responses
- [ ] `GET /health/deep` admin endpoint

### Phase 1
- [ ] `POST /me/avatar` + `DELETE /me/avatar`
- [ ] `PATCH /me/password`
- [ ] `POST /me/change-email` + `POST /me/verify-change-email`
- [ ] `DELETE /me` with PII anonymization
- [ ] `deactivatedAt` / `deletedReason` DB fields
- [ ] Username slug: expose in profile + availability endpoint
- [ ] `GET /users/:usernameOrId` public profile API
- [ ] `/users/[id]` public profile page with full stats
- [ ] `UserPrivacySettings` model + API + UI
- [ ] `contributorLevel` field + background job
- [ ] `POST /auth/request-phone-otp` + `POST /auth/verify-phone`
- [ ] `UserLoginEvent` model + write on login
- [ ] `POST /auth/logout-all`
- [ ] Recent sign-ins in profile + "Log out all devices"
- [ ] `UserBanAppeal` model + `POST /me/ban-appeal`
- [ ] Appeals queue in admin

### Phase 2
- [x] Entity DB fields: logo, cover, gallery, description, website, email, hours, social, lat/lng, displayNameUr
- [x] `PATCH /entities/:id/profile` endpoint
- [ ] `isOpenNow` computed in `GET /entities/:id`
- [ ] `openNow` search filter
- [ ] `EntityRelationship` model + admin UI
- [ ] Entity page "Related Entities" tab
- [x] `GET /entities/:id/trust-summary` with accountability metrics
- [x] `GET /entities/:id/review-summary` with freshness stats
- [ ] `EntityVerificationDocument` model + admin tab
- [ ] `GET /entities/compare` + comparison page
- [ ] Entity map pin on About tab
- [ ] Phone/website click tracking
- [x] `EntitySuggestedEdit` model + APIs + admin tab
- [x] `DuplicateCandidate` web surface + merge logic
- [x] `GET /entities/:id/similar`
- [ ] `GET /entities/nearby`
- [x] Entity status badges (claimed, under_review, suspended, merged)
- [x] Verification tier badges (Level 1-5)
- [x] `EntityResponseMetric` shown on entity page
- [x] `SalarySubmission` APIs + employer entity tab
- [x] `GET /entities/:id/trust/history` + timeline UI

### Phase 3
- [ ] Category-specific review templates (employer/school/hospital/landlord/product)
- [x] `reviewType` field + form selector
- [ ] `EvidenceItem` model replacing raw image array
- [ ] Private evidence upload with visibility toggle
- [ ] Evidence admin verification queue
- [ ] Evidence badges: "Evidence attached" / "Private evidence verified"
- [ ] `ReviewFlag` model + auto-flag pipeline (PII, competitor, profanity, duplicate text)
- [ ] Admin word-filter management page
- [x] `ReviewQualityScore` expanded fields + `fakeScore` + job
- [x] `ReviewUpdate` model + APIs + timeline UI
- [ ] `ReviewCorrectionRequest` model + APIs + notification loop
- [ ] Correction queue in admin
- [x] `ReviewDraft` model + autosave
- [ ] Review form: min body validation + category completion meter + preview step
- [ ] Review freshness indicator on cards
- [ ] @mention in comments + notification
- [x] Community validation 3-option picker UI
- [x] IssueResolution confirm/dispute UI
- [ ] Review share card endpoint
- [x] Admin review detail: quality panel + risk + timeline
- [x] Admin review actions: request_edit, mark_legal_sensitive, redact

### Phase 4
- [x] `FeedItem` + `FeedHide` DB models
- [x] Feed fan-out service
- [x] `GET /feed` + `GET /feed/me` from FeedItem
- [x] Feed card components per itemType (including owner_post, question_answered)
- [x] Feed tabs
- [x] `POST /feed/hide` + card overflow menu
- [ ] `DiscussionPoll` + `DiscussionPollOption` + `DiscussionPollVote` models
- [ ] Poll creation in discussion form + live vote display
- [x] `DiscussionPost` new fields (type, entityId, categoryId, cityId, etc.)
- [x] `GET /entities/:id/discussions`
- [ ] Discussion `resolvedAt` + `PATCH /discussions/:id/resolve`
- [x] `PATCH /discussions/:id` + `DELETE /discussions/:id`
- [x] `GET /discussions/search`
- [ ] `SavedSearch` model + APIs + saved searches tab
- [x] `DiscussionComment.parentCommentId` + threading UI
- [x] Community page redesign as reputation hub
- [ ] Admin: discussion list filters by type/entity/city

### Phase 5
- [x] `EntityClaim` new fields + verification levels 1-5
- [x] Multi-step claim wizard with tier ladder
- [ ] `OwnerTeamMember` model + team management API
- [ ] `/owner/entities/[id]/team` page + permission matrix
- [x] `/owner/entities/[id]` route group
- [x] Redirect old owner-dashboard route
- [x] Owner action center API + UI (includes unanswered Q&A count)
- [x] Owner KPIs grid + sparklines
- [ ] `OwnerPost` model + APIs + entity page "Owner Updates" section
- [ ] `/owner/entities/[id]/posts` management page
- [ ] `EntityQuestion` + `EntityAnswer` models + APIs
- [ ] Entity Q&A tab + owner Q&A queue
- [ ] Q&A notification loop
- [ ] `WatchlistAlert` model + APIs + entity page "Set Alert"
- [x] `ClaimDispute` model + APIs + admin queue
- [x] Owner review filters + actions
- [x] Template auto-suggestion in reply modal
- [x] Invite: QR code, WhatsApp share, stats per invite
- [x] Analytics export endpoints

### Phase 6
- [ ] New quality activityType values for streaks
- [ ] `ReviewStreak.shieldCount` + shield logic
- [ ] Expand `FollowTargetType`: city, user, tag, discussion
- [ ] `GET /users/:id/followers` + `/following`
- [ ] Follow recommendations API + widget
- [ ] `UserReputationScore` model + calculation + `behaviorTrustScore`
- [ ] `NotificationPreference` model + API
- [ ] Push subscription API + Web Push emit
- [ ] `EmailTemplate` model + admin email template page
- [ ] Email service: resolve template + send
- [ ] Notification read-all + filter by type + grouping
- [ ] `/dashboard/reputation` page (merge badges + streaks)
- [ ] `/dashboard/my-list` with all follow + saved + watchlist tabs
- [ ] `/dashboard/notification-settings` page
- [ ] Weekly digest notification job
- [ ] Redirect /badges /streaks /saved /follows routes

### Phase 7
- [ ] `GET /search/entities/autocomplete`
- [ ] Global search bar autocomplete
- [ ] Advanced filters: verified, hasMedia, ownerResponsive, openNow, minReviewCount, proximity
- [ ] `GET /search/entities?phone=`
- [ ] `GET /search/related` + "People also searched for" row
- [ ] `SearchQueryLog` model + write on search + click tracking
- [ ] Admin search analytics page
- [ ] `GET /entities/compare` + comparison page + search multi-select
- [ ] `GET /entities/nearby` + home page "Near you" section
- [ ] Zero-result → entity creation CTA with pre-fill

### Phase 8
- [ ] Move moderation to admin only
- [ ] `ReviewBombingIncident` model + detection job + bulk hold/release
- [ ] Community alert FeedItem on bombing incident
- [ ] Moderation queues endpoint with all sub-queue types
- [ ] `reasonCode` on `ModerationAction` + resolve form
- [ ] `ReviewCorrectionRequest` admin queue
- [ ] Case action history timeline in admin
- [ ] `POST /admin/reports/:id/create-moderation-case`
- [ ] Duplicate merge admin UI
- [ ] Claim disputes admin queue
- [ ] `PolicyService` implementation with `PlatformConfig` integration
- [ ] Admin word-filter management for profanity
- [ ] Report: wrong entity + PII options; appeal for hidden review
- [ ] Evidence redaction action in admin

### Phase 9
- [ ] `/categories/[categoryKey]` landing pages
- [ ] `/cities/[citySlug]` + `/cities/[citySlug]/[categoryKey]` landing pages
- [ ] JSON-LD schemas on entity, review, Q&A, category, city, blog pages
- [ ] Sitemap + robots.txt
- [ ] `/compare/[entityA]/vs/[entityB]`
- [ ] Blog ↔ entity internal linking
- [ ] Campaign quality rules (requiredReviewType)
- [ ] Review invite landing pages `/invite/[token]`
- [ ] Admin growth dashboard metrics

### Phase 10
- [ ] PWA manifest + service worker + Web Push handler
- [ ] `next/image` on all entity/avatar/cover images
- [ ] Dynamic imports for category extension forms
- [ ] Virtualized lists for >50 items
- [ ] Bottom sheets on mobile for review create / filters / report
- [ ] Pull-to-refresh on feeds
- [ ] Client error ring buffer + debug copy button
- [ ] Slow endpoint monitoring

### Phase 11
- [ ] `POST /auth/google` + `POST /auth/apple`
- [ ] `POST /me/link/google` + `POST /me/link/apple`
- [ ] Login/register social buttons

### Phase 12
- [ ] AuditLog cross-linking on all detail pages
- [ ] Trust recalculate + badge recalculate wired to admin detail
- [ ] Destructive action confirmation modals — consistency pass
- [ ] Final reason code check across all moderation actions

### Phase 13
- [ ] `ReviewRemovalRequest` model + owner queue + admin queue
- [ ] Bulk template reply (draft mode)
- [ ] `GET /me/impact-summary` + `/dashboard/impact` page
- [ ] Shareable impact card generation
- [ ] Verification tier ladder in owner verification page

### Phase 14
- [ ] `SuspiciousReviewerCluster` model + weekly detection job
- [ ] Admin clusters queue with confirm/false-positive actions
- [ ] Trust velocity alert job (6h interval)
- [ ] Trust velocity anomaly markers on entity trust chart
- [ ] `behaviorTrustScore` calculation wired to quality score
- [ ] `GET /entities/:id/benchmark` + `GET /owner/entities/:id/category-insights`
- [ ] Benchmarking card in owner dashboard + entity trust overview chip
- [ ] `GET /entities/:id/health-score` + owner health score card + entity ring
- [ ] `source` field on Review + import weight adjustment
- [ ] Admin import: set source, lower quality, flag as under_verification
- [ ] "Imported review" label on review cards
- [ ] `GET /admin/platform-health`

### Phase 15
- [ ] `next-intl` setup + `/en/*` + `/ur/*` routing
- [ ] `en.json` + `ur.json` translation files
- [ ] Language switcher + `preferredLanguage` on User
- [ ] RTL layout: `dir="rtl"` + logical CSS properties + Tailwind rtl: variants
- [ ] Noto Nastaliq Urdu font
- [ ] `displayNameUr` exposed in entity pages + PATCH
- [ ] `labelUr` on Category + display in picker
- [ ] `languageCode` on Review + auto-detect + filter

### Phase 16
- [ ] Contribution Score Card on public user profile
- [ ] `GET /owner/entities/:id/category-insights` UI
- [ ] `GET /entities/:id/timeline` + entity timeline tab
- [ ] Weekly admin digest job + dashboard card
- [ ] All Phase 14 health dashboard wired to admin portal

---

## Summary Table

| Phase | Name | DB Migrations | Est. New Endpoints | Duration |
|---|---|---|---|---|
| 0 | Foundation Hardening | 1 | ~8 | 1–2 weeks |
| 1 | User Identity & Profile | 4 | ~14 | 2–3 weeks |
| 2 | Entity Profile Richness & Trust Graph | 5 | ~18 | 3–4 weeks |
| 3 | Reviews Quality, Evidence & Lifecycle | 6 | ~14 | 3–4 weeks |
| 4 | Feed, Community & Discussions | 5 | ~14 | 3–4 weeks |
| 5 | Claims, Owner Dashboard & Team | 6 | ~16 | 3–4 weeks |
| 6 | Reputation, Streaks, Badges & Notifications | 4 | ~14 | 3–4 weeks |
| 7 | Search, Discovery & Comparison | 2 | ~10 | 2–3 weeks |
| 8 | Moderation, Trust Safety & Legal Ops | 2 | ~10 | 2–3 weeks |
| 9 | SEO, Campaigns, Content & Growth | 1 | ~8 | 2–3 weeks |
| 10 | PWA, Performance & Observability | 0 | 0 | 1–2 weeks |
| 11 | Auth Extension & OAuth | 0 | ~5 | 1–2 weeks |
| 12 | Admin Portal Final Polish | 0 | ~4 | 1 week |
| 13 | Owner Communication Center | 2 | ~8 | 2–3 weeks |
| 14 | Trust Intelligence Layer | 3 | ~10 | 3–4 weeks |
| 15 | Multilingual & Localization | 1 | ~3 | 2–3 weeks |
| 16 | Insights & Intelligence Dashboard | 1 | ~6 | 2–3 weeks |
| **Total** | | **~43 migrations** | **~162 endpoints** | **~36–52 weeks** |

---

## Recommended Execution Order

**Small team (2–3 devs) — strict sequence:**
```
0 → 1 → 2 → 3 → 5 → 13 → 4 → 7 → 8 → 6 → 14 → 9 → 10 → 11 → 15 → 16 → 12
```

**Parallel team (4–5 devs) — split streams:**
```
Stream A (Product/UX):     0 → 1 → 3 → 5 → 4 → 13 → 6 → 7 → 15 → 16
Stream B (Infra/Admin):    0 → 2 → 8 → 14 → 9 → 10 → 11 → 12
```

**Key sequencing rules:**
- Phase 0 is prerequisite for both streams — always first
- Phase 3 (review quality scoring) must be live before Phase 14 (trust intelligence) — needs 30 days of quality data
- Phase 5 (owner team + Q&A) before Phase 13 (owner communication center)
- Phase 6 (reputation scores) before Phase 14 (behavior trust score uses reputation data)
- Phase 15 (multilingual) is frontend-heavy and can be parallelized with any phase
- Phase 14 (Trust Intelligence) requires a 2-day architecture review before implementation — it touches review, user, entity, and moderation modules simultaneously

---

## Architecture & Coding Standards

**Backend (NestJS)**
- Controllers: HTTP routing + DTO validation only
- Services: all business logic; no raw Prisma in controllers
- Use `TrustEventService` for all trust signal emissions
- Use `PolicyService` for all eligibility checks
- Use `EventEmitter2` event bus for cross-module triggers
- DB transactions for multi-step writes
- Audit log for: claim approve/reject, user suspend/ban, entity merge, review remove, all admin content actions
- All endpoints: Swagger `@ApiOperation` + `@ApiResponse`

**Frontend (Next.js)**
- Guest read on all discovery pages; protected routes for all mutations
- Every mutation: loading → error → success states
- Optimistic UI for: votes, follows, saves, reactions, comment post
- NOT optimistic for: review submit, claim submit, account deletion
- Mobile responsive, test at 375px; bottom sheets on mobile for forms/filters
- Old routes always redirect (301), never 404

**Admin Portal**
- Every destructive action: confirmation modal with explicit consequence description
- All moderation/claims/legal-sensitive actions: required reason code
- Import flows: return per-row success/error counts

---

*Break each phase into a Linear/Jira epic with individual task tickets before sprint planning. Use the tracking checklist as the source of truth for sprint planning. Phase 14 (Trust Intelligence) requires a dedicated architecture session before implementation begins.*
