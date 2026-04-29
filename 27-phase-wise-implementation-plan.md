# ReviewHistory Platform — Phase-Wise Implementation Plan

> **Prepared:** 2026-04-26 · **Revised:** 2026-04-26 (merged GPT doc set)
> **Scope:** Web app · Admin portal · NestJS API · PostgreSQL/Prisma DB
> **Based on:** Current spec analysis + Claude suggestions + GPT 8-phase doc set

---

## How to Read This Document

Each phase has a **goal statement**, followed by work items grouped by layer:

- `[DB]` — Prisma schema migration required
- `[API]` — NestJS endpoint or service change
- `[WEB]` — Next.js web app page or component
- `[ADMIN]` — Admin portal change
- `[CLIENT]` — Client-side infra (API helpers, sockets, state)

**Priority labels:** `[BLOCKER]` must ship before phase ends · `[HIGH]` strong ROI · `[MED]` improves depth · `[LOW]` polish

---

## Core Product Decision

> The platform must not become a generic social network.
> It is a **trust and reputation network** where the **entity profile is the center**.
> Every feature must connect back to: entity · review · discussion · claim · owner response · user reputation · category · city · moderation signal.

---

## Pre-Phase Audit: What DB Has That Web/API Hasn't Exposed Yet

Before writing a single new line of code, surface what already exists in Prisma:

| DB Model | Exposed? | Gap |
|---|---|---|
| `ReviewQualityScore` | ❌ | Not shown on entity or feed cards |
| `CommunityValidation` enum (`confirmed/outdated/resolved`) | ⚠️ | Enum values never documented in web spec |
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

**All of Phase 0 closes these gaps with zero new DB migrations.**

---

## Phase 0 — Foundation Hardening *(1–2 weeks)*

**Goal:** Fix broken flows, close spec gaps, expose what DB already has. Zero new features.

### 0.1 Client Infrastructure `[BLOCKER]`

- `[CLIENT]` Add `429 Too Many Requests` handler to `apiGet/apiPost/apiPatch/apiDelete` — read `Retry-After` header, implement exponential backoff
- `[CLIENT]` Add `403` handler — show "access denied" page/toast, do not silently fail
- `[CLIENT]` Add `5xx` stable fallback — show generic error message, never expose raw server errors
- `[CLIENT]` Add network error catch-all — show retry CTA
- `[CLIENT]` Socket reconnect handler: on `disconnect`, re-join all active rooms (`join:feed`, `join:discussion`, etc.), refetch cursor delta since last `nextCursor`, deduplicate incoming events to avoid double-render
- `[CLIENT]` Optimistic UI for: review votes, comment reactions, discussion reactions, follow/unfollow, save/unsave, notification read — update local state instantly, revert on API error with toast
- `[CLIENT]` Feed scroll position restoration: persist `nextCursor` + scroll offset in `sessionStorage` keyed by route, restore on back-navigation

### 0.2 Auth Flow Documentation `[BLOCKER]`

- `[API]` Document `/auth/login` response shape when `requiresVerification: true` — must explicitly include `{ requiresVerification, otpRequestId, email }` in response body — currently undocumented, causes frontend guesswork
- `[WEB]` `/auth/login` — read `otpRequestId` from login response body before redirecting to `/auth/verify`, not from URL construction

### 0.3 Expose Already-Built DB Features `[HIGH]`

- `[API]` Enforce `CommunityValidationType` enum (`confirmed | outdated | resolved`) as typed DTO in `POST /reviews/:id/validations` — currently `validationType` is an untyped string
- `[API]` `GET /reviews/:id/validations` — include counts per `validationType` in response, not just a raw list
- `[WEB]` Review cards: show `ReviewQualityScore.totalScore` as quality badge (`Detailed` / `Brief`) — data is already computed in DB
- `[WEB]` Review cards: show `IssueResolution.status` — if `resolved_by_owner` → "Owner resolved this"; if `confirmed_resolved` → "Resolved ✓"
- `[WEB]` Owner dashboard reviews tab: show `IssueResolution` status column per review
- `[API]` `POST /entities/:id/invites` — accept and persist `maxUses?`, `expiresAt?`, `label?` — all fields already exist on `ReviewInvite` model
- `[ADMIN]` User detail: show `UserDevice` list (fingerprint hash, risk score, first/last seen) — data already collected

### 0.4 Notification Read-All `[HIGH]`

- `[API]` `PATCH /notifications/read-all` already exists in API spec but is missing from web spec — wire it
- `[WEB]` `/dashboard/notification` — add "Mark all as read" button

### 0.5 Analytics Fire-and-Forget `[MED]`

- `[WEB]` `POST /analytics/entities/:id/page-view` — make non-blocking (fire-and-forget, no `await`), debounce to ignore repeat calls within 30s for same entity in same tab session

### 0.6 Onboarding Re-Entry `[MED]`

- `[API]` `PUT /onboarding/preferences` already exists — expose it from the profile dashboard
- `[WEB]` `/dashboard/profile` — add "Update Interests" section that calls `PUT /onboarding/preferences` with `categoryKeys` + `selectedCityId`

### 0.7 Admin Stability `[MED]`

- `[ADMIN]` Add session-expired error boundary — currently admin may silently fail on expired session
- `[ADMIN]` Add proper "Access Denied" page for unauthorized role access — replace raw redirect
- `[ADMIN]` Verify admin auth refresh flow matches web pattern (`POST /auth/refresh` → retry)

---

## Phase 1 — User Identity & Profile Depth *(2–3 weeks)*

**Goal:** Give users a real identity — avatar, public profile, privacy controls, account security, phone verification.

### 1.1 User Avatar `[BLOCKER]`

- `[DB]` Add to `User`: `avatarUrl String? @map("avatar_url") @db.VarChar(500)`
- `[API]` `POST /me/avatar` — multipart, stores via upload service, returns `{ avatarUrl }`
- `[API]` `DELETE /me/avatar` — remove avatar, set to null
- `[WEB]` Profile page: avatar upload with client-side crop preview, remove button
- `[WEB]` Validate file MIME type and size client-side before upload (max 5MB, `image/jpeg|png|webp` only), show compression preview
- `[ADMIN]` User detail: show avatar thumbnail

### 1.2 Account Security Endpoints `[BLOCKER]`

- `[API]` `PATCH /me/password` — `{ currentPassword, newPassword }` — verify current password before updating; add audit log entry
- `[API]` `POST /me/change-email` — `{ newEmail, password }` → verify password, send OTP to `newEmail`; returns `otpRequestId`
- `[API]` `POST /me/verify-change-email` — `{ otpRequestId, code }` → confirm OTP, update email, revoke other sessions
- `[API]` `DELETE /me` — soft-delete: set `deletedAt`, set `deletedReason`, anonymize PII (`email → deleted+uuid`, `phoneE164 → deleted`), revoke all sessions — required for GDPR/PDPA
- `[DB]` Add to `User`: `deactivatedAt DateTime?`, `deletedReason String? @db.VarChar(200)`
- `[WEB]` `/dashboard/profile` — account settings section: password change form, email change form, account deletion flow with explicit consequence modal

### 1.3 Username Slug `[HIGH]`

`usernameSlug` already exists in `User` model — expose it:

- `[API]` `PATCH /me` — accept `usernameSlug` with uniqueness validation (alphanumeric + hyphens, 3–30 chars)
- `[WEB]` Profile page: editable username field with availability check (debounced `GET /me/check-username?slug=...`)
- `[API]` `GET /me/check-username?slug=` — returns `{ available: boolean }`
- `[WEB]` Public profile URL: `/users/[usernameSlug]` (falling back to UUID if no slug set)

### 1.4 Public User Profile `[HIGH]`

- `[API]` `GET /users/:usernameOrId` — returns public-safe profile: avatar, displayName, city (if public), bio, badges, stats, contributorLevel — never includes email/phone
- `[API]` `GET /users/:id/reviews` — paginated public reviews (respects privacy settings)
- `[API]` `GET /users/:id/discussions` — paginated public discussions
- `[API]` `GET /users/:id/reputation` — public reputation summary
- `[WEB]` New route `/users/[usernameSlug]`:
  - Avatar, display name, city (if public), bio, member since
  - Contributor level badge + progress
  - Badge grid, streak stats, helpful votes received
  - Public reviews (paginated), public discussions
  - Followers/following counts + Follow button
- `[WEB]` All review cards, discussion cards, comment author names → link to `/users/:id`

### 1.5 Privacy Settings `[HIGH]`

- `[DB]` New model:
  ```prisma
  model UserPrivacySettings {
    id                   String  @id @default(uuid()) @db.Uuid
    userId               String  @unique @map("user_id") @db.Uuid
    isProfilePrivate     Boolean @default(false) @map("is_profile_private")
    showCityPublicly     Boolean @default(true) @map("show_city_publicly")
    showReviewsPublicly  Boolean @default(true) @map("show_reviews_publicly")
    showBadgesPublicly   Boolean @default(true) @map("show_badges_publicly")
    showStreaksPublicly  Boolean @default(true) @map("show_streaks_publicly")
    allowFollowers       Boolean @default(true) @map("allow_followers")
    defaultAnonymous     Boolean @default(false) @map("default_anonymous")
    user User @relation(fields: [userId], references: [id])
    @@map("user_privacy_settings")
  }
  ```
- `[API]` `GET /me/privacy` · `PATCH /me/privacy`
- `[WEB]` Privacy settings panel in `/dashboard/profile`
- `[WEB]` Review form: if `defaultAnonymous = true`, pre-check the "post anonymously" toggle

### 1.6 Contributor Levels `[MED]`

- `[DB]` Add to `User`: `contributorLevel String @default("new_member") @map("contributor_level") @db.VarChar(30)`
- Levels (computed by background job): `new_member → verified_member → helpful_reviewer → trusted_contributor → community_expert → category_expert`
- `[API]` Include `contributorLevel` in `GET /me` and `GET /users/:id` responses
- `[WEB]` Show contributor level label + subtle progress hint on public profile and dashboard sidebar

### 1.7 Phone Verification Flow Completion `[MED]`

Phone is collected at registration but never verified — complete the loop:

- `[API]` `POST /auth/request-phone-otp` — `{ phone }` — send OTP via SMS
- `[API]` `POST /auth/verify-phone` — `{ otpRequestId, code }` → set `isPhoneVerified = true`
- `[WEB]` Profile page: "Verify your phone number" CTA when `isPhoneVerified = false`, with OTP input modal
- Phone verification will be required as prerequisite for claim submission (Phase 5)

### 1.8 Media Upload Standards `[MED]`

Standardize upload behavior across all forms (reviews, discussions, entity, avatar):

- `[CLIENT]` Client-side validation before upload: MIME type check, max size (5MB), show size error inline
- `[CLIENT]` Client-side image compression using `browser-image-compression` before uploading
- `[CLIENT]` Image preview after selection, with remove (×) button before final submission
- `[API]` Server-side: re-validate MIME type, enforce max dimensions, auto-compress via sharp before CDN storage
- `[WEB]` Consistent upload component reused across all forms

---

## Phase 2 — Entity Profile Richness *(2–3 weeks)*

**Goal:** Make entity pages the credible centerpiece. Media, rich metadata, trust summary, review summary, similar entities, duplicate reporting.

### New Entity Page Layout

```
Entity Header
 ├── logo · cover image · name · category · city/locality
 ├── verified / claimed badge · trust score · avg rating
 └── Follow · Save · Write Review · Claim / Report

Trust Overview
 ├── Trust Score · Review Count · Verified Review %
 ├── Owner Response Rate · Complaint Resolution Rate
 └── Sentiment Trend (recent 30 days)

Review Summary
 ├── Rating breakdown · Common positive tags
 ├── Common warning tags · Recent complaints
 └── Owner response summary

Tabs
 ├── Reviews
 ├── Discussions (entity-linked)
 ├── About (metadata, hours, links)
 ├── Trust & Verification
 ├── Owner Replies
 ├── Photos / Evidence
 └── Similar Entities
```

### 2.1 Entity Base Media & Metadata `[BLOCKER]`

- `[DB]` Add to `Entity` model:
  ```prisma
  logoUrl         String?  @map("logo_url") @db.VarChar(500)
  coverImageUrl   String?  @map("cover_image_url") @db.VarChar(500)
  galleryUrls     String[] @default([]) @map("gallery_urls")
  description     String?  @db.Text
  websiteUrl      String?  @map("website_url") @db.VarChar(500)
  officialEmail   String?  @map("official_email") @db.VarChar(255)
  businessHoursJson Json?  @map("business_hours_json")
  socialLinksJson Json?    @map("social_links_json")
  ```
  Note: `alternatePhonesJson` already exists — ensure it's surfaced in API/UI.
- `[API]` `PATCH /entities/:id` — accept all new fields
- `[API]` `POST /entities` — accept on creation
- `[API]` New dedicated `PATCH /entities/:id/profile` — accepts the enriched metadata fields only, separate from core entity CRUD — cleaner ownership (owner can update profile, admin can update both)
- `[ADMIN]` Entity create/edit forms: add all new fields, media gallery upload
- `[WEB]` Entity header: logo, cover image, website, social links
- `[WEB]` About tab: hours, official email, description, alternate phones, gallery

### 2.2 Trust Summary API `[HIGH]`

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
  }
  ```
- `[WEB]` Trust Overview section: 4 KPI cards (Trust Score, Response Rate, Reviews, Resolution Rate) + sentiment sparkline
- Response rate labels: >80% → "Highly Responsive", >50% → "Active Owner", <20% → "Low Response Rate"

### 2.3 Review Summary API `[HIGH]`

- `[API]` `GET /entities/:id/review-summary` — returns:
  ```ts
  {
    ratingBreakdown: { 1: n, 2: n, 3: n, 4: n, 5: n };
    topPositiveTags: { key, label, count }[];
    topWarningTags: { key, label, count }[];
    recentComplaints: Review[];        // 1–2 star, most recent
    ownerRepliedCount: number;
    ownerRepliedPercent: number;
    communityValidatedCount: number;
  }
  ```
- `[WEB]` Review summary section above the reviews tab

### 2.4 Entity Status Visibility `[HIGH]`

- `[WEB]` Entity page: show status badge per `EntityStatus`:
  - `claimed` → "Claimed" chip
  - `under_review` → "Under Review" warning banner
  - `suspended` → full-page warning with reason
  - `merged` → redirect to canonical entity (2.6) + "This listing was merged into [X]"
- `[WEB]` Entity page: show verification level badge once claims system (Phase 5) is live

### 2.5 Suggest Entity Edit `[HIGH]`

- `[DB]` New model:
  ```prisma
  model EntitySuggestedEdit {
    id              String   @id @default(uuid()) @db.Uuid
    entityId        String   @map("entity_id") @db.Uuid
    suggestedByUserId String? @map("suggested_by_user_id") @db.Uuid
    fieldName       String   @map("field_name") @db.VarChar(100)
    oldValue        String?  @map("old_value") @db.Text
    newValue        String   @map("new_value") @db.Text
    evidenceUrl     String?  @map("evidence_url") @db.VarChar(500)
    note            String?  @db.VarChar(500)
    status          String   @default("pending") @db.VarChar(20) // pending|approved|rejected
    reviewedByAdminId String? @map("reviewed_by_admin_id") @db.Uuid
    reviewedAt      DateTime? @map("reviewed_at")
    createdAt       DateTime @default(now()) @map("created_at")
    entity Entity @relation(fields: [entityId], references: [id])
    @@index([entityId, status])
    @@map("entity_suggested_edits")
  }
  ```
- `[API]` `POST /entities/:id/suggest-edits` — `{ fieldName, newValue, evidenceUrl?, note? }`
- `[API]` `GET /entities/:id/suggested-edits` — for owner/admin
- `[API]` `POST /admin/entities/:id/suggested-edits/:editId/approve`
- `[API]` `POST /admin/entities/:id/suggested-edits/:editId/reject`
- `[WEB]` "Suggest an Edit" link on entity page (auth required)
- `[ADMIN]` Entity detail: suggested edits queue tab

### 2.6 Duplicate Entity Report & Merge `[HIGH]`

DB already has `DuplicateCandidate` + `DuplicateMergeVote` — add web/API surface:

- `[API]` `POST /entities/:id/report-duplicate` — `{ duplicateEntityId, reason? }` — creates or votes on `DuplicateCandidate`
- `[API]` `GET /admin/entities/duplicates` — list pending candidates with similarity score
- `[API]` `GET /admin/entities/duplicates/:id` — detail with side-by-side comparison payload
- `[API]` `PATCH /admin/entities/duplicates/:id` — `{ action: 'confirm' | 'reject' }`
- `[API]` `POST /admin/entities/duplicates/:id/merge` — `{ canonicalEntityId }` — executes merge:
  - Source entity → `status: merged`
  - Canonical entity → remains `active`
  - Create `EntityAlias` entries pointing source name to canonical
  - Move/relink reviews from source to canonical
  - Handle claims on source (notify owner)
  - Redirect followers of source to canonical
  - Emit `entity_merged` notification to affected users
  - Create audit log entry
  - Old entity URL should 301-redirect to canonical
- `[WEB]` Entity page overflow menu → "Report as duplicate"
- `[WEB]` Merged entity page: redirect to canonical with "This listing was merged into [X]" message
- `[ADMIN]` Duplicates queue page at `/admin/entities/duplicates`
- `[ADMIN]` Side-by-side comparison UI: name, category, city/locality, phone, address, reviews, claims, followers, created date, trust score

### 2.7 Similar Entities `[MED]`

- `[API]` `GET /entities/:id/similar` — ranked by:
  1. Same category + same locality (highest priority)
  2. Same category + same city
  3. Same category + nearby city
- `[WEB]` Entity page: Similar Entities tab / side rail

### 2.8 Entity Response Metrics — Public Display `[MED]`

`EntityResponseMetric` fetched in owner dashboard but never shown publicly:

- `[WEB]` Entity page Trust Overview: show `responseRate`, `avgResponseTimeHours`, `issuesResolvedCount`

### 2.9 Salary Submissions `[MED]`

`SalarySubmission` model exists with no web/API coverage:

- `[API]` `POST /entities/:entityId/salary-submissions` · `GET /entities/:entityId/salary-submissions`
- `[WEB]` Employer entity pages: "Salary Insights" tab with anonymized salary ranges per job title
- `[WEB]` "Add Salary" CTA on employer entity pages (auth required)
- `[ADMIN]` Entity detail: salary submissions tab

### 2.10 Trust Score Event Timeline `[LOW]`

`TrustScoreEvent` exists with no UI:

- `[API]` `GET /entities/:id/trust/history` — sanitized event timeline for public display
- `[WEB]` Entity page Trust & Verification tab: expandable trust event timeline with human-readable labels ("New review received", "Owner reply added", "Suspicious review removed")

---

## Phase 3 — Reviews Quality & Lifecycle *(3–4 weeks)*

**Goal:** Make reviews structured, credible, lifecycle-aware, and harder to fake.

### 3.1 Review Type `[HIGH]`

- `[DB]` Add `reviewType String @default("experience") @map("review_type") @db.VarChar(30)` to `Review`
  - Values: `experience | complaint | warning | recommendation | question | update | resolution`
- `[API]` Accept `reviewType` in `POST /entities/:id/reviews` and `PATCH /reviews/:id`
- `[WEB]` Review form: optional type selector with per-type description
- `[WEB]` Review cards: type label chip (e.g. "⚠️ Complaint", "✓ Recommendation", "❓ Question")

### 3.2 Review Quality Score — Full Implementation `[HIGH]`

`ReviewQualityScore` model exists but isn't fully implemented. Complete it:

- `[DB]` Expand `ReviewQualityScore` fields:
  ```prisma
  textDepthScore      Decimal @default(0) @map("text_depth_score") @db.Decimal(3,2)
  evidenceScore       Decimal @default(0) @map("evidence_score") @db.Decimal(3,2)
  reviewerTrustScore  Decimal @default(0) @map("reviewer_trust_score") @db.Decimal(3,2)
  categoryDataScore   Decimal @default(0) @map("category_data_score") @db.Decimal(3,2)
  helpfulnessScore    Decimal @default(0) @map("helpfulness_score") @db.Decimal(3,2)
  reportPenalty       Decimal @default(0) @map("report_penalty") @db.Decimal(3,2)
  duplicatePenalty    Decimal @default(0) @map("duplicate_penalty") @db.Decimal(3,2)
  spamPenalty         Decimal @default(0) @map("spam_penalty") @db.Decimal(3,2)
  label               String  @default("basic") @db.VarChar(30)
  calculatedAt        DateTime @default(now()) @map("calculated_at")
  ```
- Quality labels: `low_quality | basic | detailed | evidence_backed | trusted`
- `[API]` Background job/event listener: recalculate on review create, edit, vote, report, validation
- `[WEB]` Review cards: quality badge per label — `evidence_backed` and `trusted` get prominent styling; `low_quality` gets reduced visual weight
- `[ADMIN]` Review detail: quality score breakdown panel showing each sub-score

### 3.3 Review Update (Append, Not Replace) `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ReviewUpdate {
    id           String   @id @default(uuid()) @db.Uuid
    reviewId     String   @map("review_id") @db.Uuid
    authorUserId String   @map("author_user_id") @db.Uuid
    body         String   @db.Text
    evidenceUrls String[] @default([]) @map("evidence_urls")
    updateType   String   @default("follow_up") @map("update_type") @db.VarChar(30)
    // values: follow_up|owner_resolved|issue_worsened|correction|additional_evidence
    editedAt     DateTime? @map("edited_at")
    createdAt    DateTime @default(now()) @map("created_at")
    review Review @relation(fields: [reviewId], references: [id])
    @@map("review_updates")
  }
  ```
- `[API]` `POST /reviews/:id/updates` — `{ body, updateType, evidenceUrls? }` — author only, max 3 updates per review
- `[API]` `GET /reviews/:id/updates`
- `[WEB]` Review card/detail: show original review + chronological updates with timestamps ("Updated April 2026: Owner resolved the issue")
- `[WEB]` Review page: "Add Update" option distinct from "Edit Review"

### 3.4 Review Backend Draft API `[HIGH]`

localStorage autosave is MVP; also add backend drafts for cross-device continuity:

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
- `[WEB]` Review form: debounced autosave to `localStorage` (immediate) + API (every 30s), "Continue draft?" restore banner on mount
- Clear draft on successful submit or explicit discard

### 3.5 Review Form Improvements `[HIGH]`

- `[WEB]` Review form: minimum `body` length 30 chars with live character counter + error message
- `[WEB]` Review form: category-specific rating completion meter (e.g. "3/6 fields completed") — encourages filling structured fields
- `[WEB]` Review form: "Preview" step before final submit showing how the review will look
- `[API]` Review create/edit DTO: `@MinLength(30)` and `@MaxLength(5000)` on `body`

### 3.6 Evidence Images in Review Edit `[HIGH]`

- `[API]` `PATCH /reviews/:id` — add `addEvidenceImages[]` (files) and `removeEvidenceUrls[]` (array of existing URLs to remove)
- `[WEB]` Review edit form: show existing evidence thumbnails with (×) remove button, allow adding new images

### 3.7 Community Validation UI Completion `[MED]`

Enum `CommunityValidationType` has `confirmed | outdated | resolved` — give them meaning:

- `[WEB]` Validation button: 3-option picker — "I had a similar experience" · "This seems outdated" · "Issue was resolved"
- `[WEB]` Review card: validation summary — "12 confirmed this · 3 say outdated"
- `[API]` `GET /reviews/:id/validations` — return counts per type

### 3.8 Review Timeline View `[MED]`

- `[WEB]` Review detail page: chronological timeline showing:
  - "Review posted"
  - "Owner replied"
  - "User added update"
  - "Community confirmed (n)"
  - "Issue resolved"
  - "Admin action" (if relevant and non-sensitive)

### 3.9 IssueResolution Full Flow `[MED]`

`IssueResolution` model exists — complete the flow:

- `[WEB]` Review card: if `status = resolved_by_owner` → show "Owner marked as resolved" with CTA for reviewer to confirm or dispute
- `[API]` `PATCH /reviews/:reviewId/issue-resolution` — `{ action: 'confirm' | 'dispute' }` — reviewer only
- `[WEB]` Owner dashboard: "Mark as Resolved" button on review row → creates `IssueResolution` linked to a reply

### 3.10 Admin Review Detail Enhancement `[MED]`

- `[ADMIN]` Review detail page additions:
  - Quality score breakdown (sub-scores)
  - Risk signals (risk state, moderation state, fake vote count)
  - Duplicate text detection summary
  - Full report history
  - Community validation breakdown
  - Owner reply + issue resolution status
  - Review updates timeline
  - Status history timeline
- `[ADMIN]` Moderation actions for reviews: add `request_edit`, `mark_legal_sensitive`, `redact_personal_information` to existing actions

### 3.11 Presigned Upload Flow `[LOW]`

Decouple upload latency from form submission — implement for Phase 3+:

- `[API]` `POST /upload/presigned` — `{ filename, mimeType, context: 'review'|'discussion'|'profile'|'entity' }` → `{ uploadUrl, fileUrl }`
- `[CLIENT]` Upload file directly to CDN via presigned URL with real progress bar
- `[WEB]` Review and discussion forms: use presigned flow, submit `fileUrl` strings instead of binary
- Keep existing multipart routes as fallback for backward compat

---

## Phase 4 — Feed, Community & Discussions *(3–4 weeks)*

**Goal:** Convert feed to mixed reputation activity. Make discussions entity/category/city-linked. Give community a unique identity.

### Defined Page Roles

```
/feed        = personalized mixed reputation activity feed
/discussions = topic-first, entity/category/city-linked conversations
/community   = reputation hub: leaderboard, trusted contributors, local/category groups
```

### 4.1 Mixed Activity Feed — FeedItem Model `[BLOCKER]`

- `[DB]` New model:
  ```prisma
  model FeedItem {
    id          String   @id @default(uuid()) @db.Uuid
    itemType    String   @map("item_type") @db.VarChar(40)
    // values: review_created|discussion_created|owner_replied|entity_claimed
    //         entity_verified|review_trending|user_badge_earned|community_alert
    //         issue_resolved|campaign_started
    actorUserId String?  @map("actor_user_id") @db.Uuid
    entityId    String?  @map("entity_id") @db.Uuid
    reviewId    String?  @map("review_id") @db.Uuid
    discussionId String? @map("discussion_id") @db.Uuid
    categoryId  String?  @map("category_id") @db.Uuid
    cityId      String?  @map("city_id") @db.Uuid
    payloadJson Json     @map("payload_json")     // snapshot of display data
    rankingScore Decimal @default(0) @map("ranking_score") @db.Decimal(6,2)
    visibility  String   @default("public") @db.VarChar(20) // public|followers|city
    createdAt   DateTime @default(now()) @map("created_at")
    expiresAt   DateTime? @map("expires_at")
    @@index([itemType, createdAt(sort: Desc)])
    @@index([entityId, itemType])
    @@index([cityId, itemType])
    @@index([rankingScore(sort: Desc)])
    @@map("feed_items")
  }

  model FeedHide {
    id        String   @id @default(uuid()) @db.Uuid
    userId    String   @map("user_id") @db.Uuid
    refType   String   @map("ref_type") @db.VarChar(30) // entity|category|user|discussion
    refId     String   @map("ref_id") @db.Uuid
    createdAt DateTime @default(now()) @map("created_at")
    @@unique([userId, refType, refId])
    @@index([userId])
    @@map("feed_hides")
  }
  ```
- `[API]` Background fan-out service: on review create/discussion create/owner reply/entity verified/badge earned → write `FeedItem` with `payloadJson` snapshot
- `[API]` `GET /feed` and `GET /feed/me` — query `FeedItem`, personalize by follow graph, exclude `FeedHide` records
- Query params: `tab=for_you|following|nearby|trending|latest|verified`, `categoryKey?`, `cityId?`, `entityId?`, `cursor?`, `pageSize?`

### 4.2 Feed Cards by Item Type `[BLOCKER]`

- `[WEB]` Feed renders different card components per `itemType`:
  - `review_created` → standard review card
  - `discussion_created` → discussion preview card with linked entity/category chip
  - `owner_replied` → "Owner replied to a negative review at [Entity]" card showing before/after trust signal
  - `entity_verified` → "Entity was verified by admin" announcement card with follow CTA
  - `entity_claimed` → "[Entity] is now claimed" card
  - `issue_resolved` → "[Reviewer] confirmed issue resolved at [Entity]" card
  - `user_badge_earned` → "[User] earned [Badge]" community card
  - `community_alert` → admin-posted alert card
- `[WEB]` Feed tabs: For You · Following · Nearby · Trending · Latest · Verified

### 4.3 Feed "Not Interested" / Hide `[HIGH]`

- `[API]` `POST /feed/hide` — `{ refType: 'entity'|'category'|'user'|'discussion', refId }` — writes to `FeedHide`, excludes from future feed
- `[WEB]` Feed cards: overflow menu → "Not interested in [entity name]" / "Hide posts from this user"

### 4.4 Discussion Entity/Category/City Linking `[BLOCKER]`

`DiscussionPost` currently has no relation fields — add them:

- `[DB]` Add to `DiscussionPost`:
  ```prisma
  discussionType String  @default("general") @map("discussion_type") @db.VarChar(30)
  // general|question|complaint_discussion|local_alert|entity_discussion
  // category_discussion|experience_request|poll
  entityId    String?  @map("entity_id") @db.Uuid
  categoryId  String?  @map("category_id") @db.Uuid
  cityId      String?  @map("city_id") @db.Uuid
  reviewId    String?  @map("review_id") @db.Uuid
  tagsJson    Json?    @map("tags_json")
  editedAt    DateTime? @map("edited_at")
  ```
- `[API]` `POST /discussions` — accept all new fields
- `[API]` `GET /entities/:id/discussions` — discussions linked to this entity
- `[WEB]` Discussion create form: optional "Link to entity/category/city" typeahead search
- `[WEB]` Entity page: "Discussions" tab showing entity-linked discussions
- `[WEB]` Discussion cards: show linked entity chip with click-through

### 4.5 Discussion Edit & Delete `[HIGH]`

- `[API]` `PATCH /discussions/:id` — `{ title?, body?, image? }` — author only, within 24h edit window, sets `editedAt`
- `[API]` `DELETE /discussions/:id` — author only, soft-delete (`deletedAt`)
- `[WEB]` Discussion cards: Edit / Delete in overflow menu for own posts

### 4.6 Discussion Search `[HIGH]`

- `[API]` `GET /discussions/search?q=&categoryKey=&entityId=&cityId=&discussionType=` — full-text search on `title` + `body`
- `[WEB]` Discussions page: search input with debounce
- `[WEB]` Global `/search` page: "Discussions" tab alongside "Entities"

### 4.7 Discussion Comment Threading `[MED]`

- `[DB]` Add to `DiscussionComment`:
  ```prisma
  parentCommentId String?  @map("parent_comment_id") @db.Uuid
  editedAt        DateTime? @map("edited_at")
  ```
  With self-relation: `parentComment DiscussionComment? @relation("CommentReplies", fields: [parentCommentId], references: [id])`
- `[API]` `POST /discussions/:id/comments` — accept `parentCommentId?`
- `[API]` `POST /discussions/:id/comments/:commentId/replies` — convenience alias
- `[WEB]` Discussion comments: 1-level nested replies, "Reply" button, collapsed beyond 3 replies

### 4.8 Community Page Redesign `[HIGH]`

Community must not duplicate feed. Its unique content:

- `[WEB]` `/community` sections:
  - Trusted Contributors (top reviewers by contribution score + helpful votes)
  - Leaderboard (streaks, helpful votes, review count)
  - City Communities (trending discussions + top entities per city)
  - Category Communities (top entities + recent reviews per category)
  - Trending Discussions this week
  - Weekly Top Reviewers
- `[WEB]` Remove review feed cards from community page — they belong in `/feed`

### 4.9 Admin Discussion Controls `[MED]`

- `[ADMIN]` Discussion detail: show linked entity/category/city, edit status
- `[ADMIN]` Discussion list: filter by `discussionType`, `entityId`, `cityId`
- `[ADMIN]` Discussion detail: "Convert to Moderation Case" action button

### 4.10 Socket Events for New Feed Types `[MED]`

- `[API]` Emit `feed:new_item` with `itemType` discriminator instead of just `feed:new_review`
- `[CLIENT]` Feed socket handler: render correct card component per `itemType`

---

## Phase 5 — Claims & Owner Dashboard *(3–4 weeks)*

**Goal:** Multi-level claims, owner action center, invite improvements, owner route restructure.

### 5.1 Claim Verification Levels `[BLOCKER]`

- `[DB]` Add to `EntityClaim`:
  ```prisma
  verificationLevel    Int      @default(1) @map("verification_level") @db.SmallInt
  rejectionReason      String?  @map("rejection_reason") @db.VarChar(500)
  resubmissionAllowed  Boolean  @default(false) @map("resubmission_allowed")
  expiresAt            DateTime? @map("expires_at")
  revokedReason        String?  @map("revoked_reason") @db.VarChar(500)
  transferRequestedToUserId String? @map("transfer_requested_to_user_id") @db.Uuid
  ```
- Derived levels (from `verificationMethod`): 0=unclaimed · 1=phone_otp · 2=business_email · 3=document · 4=admin_verified · 5=trusted_owner
- `[DB]` Add `business_email` and `document_upload` to `ClaimVerificationMethod` enum
- `[API]` `POST /entities/:id/claims` — accept `verificationMethod: 'phone_otp' | 'business_email' | 'document_upload'` with appropriate evidence
- `[API]` `POST /entities/:id/claims/:claimId/resubmit` — for rejected claims with `resubmissionAllowed = true`
- `[WEB]` Claim flow: multi-step wizard (choose method → verify → confirmation + next steps)
- `[WEB]` `/dashboard/claims`: show `verificationLevel` badge, `rejectionReason` when rejected, resubmit CTA if `resubmissionAllowed`
- `[ADMIN]` Claim detail: verification method, submitted docs, submitted email/phone, existing owners, duplicate claim history, decision history; approve/reject with `rejectionReason`, `resubmissionAllowed` toggle

### 5.2 Claim Dispute & Transfer `[HIGH]`

- `[DB]` New model:
  ```prisma
  model ClaimDispute {
    id               String   @id @default(uuid()) @db.Uuid
    entityId         String   @map("entity_id") @db.Uuid
    reportedByUserId String   @map("reported_by_user_id") @db.Uuid
    reason           String   @db.VarChar(500)
    evidenceUrls     String[] @default([]) @map("evidence_urls")
    status           String   @default("open") @db.VarChar(20)
    resolvedBy       String?  @map("resolved_by") @db.Uuid
    adminNotes       String?  @map("admin_notes") @db.Text
    createdAt        DateTime @default(now()) @map("created_at")
    @@map("claim_disputes")
  }
  ```
- `[API]` `POST /entities/:id/claims/:claimId/dispute` — `{ reason, evidenceUrls? }`
- `[API]` `POST /entities/:id/claims/:claimId/transfer` — `{ transferToEmail, reason }` — admin-mediated
- `[WEB]` Entity page: "Report incorrect ownership" option when entity is claimed
- `[ADMIN]` Claim disputes queue at `/admin/claims/disputes`

### 5.3 Owner Route Restructure `[HIGH]`

- `[WEB]` New owner route group:
  ```
  /owner/entities                    → list of owned entities
  /owner/entities/[id]               → dashboard home (action center + KPIs)
  /owner/entities/[id]/reviews        → review management
  /owner/entities/[id]/analytics      → analytics dashboard
  /owner/entities/[id]/profile        → edit entity profile
  /owner/entities/[id]/invites        → review invites
  /owner/entities/[id]/verification   → claim status + verification level
  ```
- `[WEB]` Redirect `/entities/[id]/owner-dashboard` → `/owner/entities/[id]` (301, preserve backward compat)
- `[WEB]` Owner layout: separate sidebar nav from public entity browsing layout

### 5.4 Owner Action Center `[HIGH]`

- `[API]` `GET /owner/entities/:id/action-center`:
  ```ts
  {
    unrepliedReviews: number;
    negativeUnreplied: number;     // 1-2 star, no reply
    profileCompletionPct: number;
    pendingVerificationDocs: number;
    newReviewsThisWeek: number;
    trustScoreDelta7d: number;     // negative = dropped
    unresolvedComplaints: number;
    inviteConversionsThisMonth: number;
  }
  ```
- `[WEB]` Owner dashboard home: Action Center card as first component with direct deep-links per item

### 5.5 Owner Dashboard KPIs `[HIGH]`

- `[WEB]` Owner KPI grid:
  - Average Rating · Trust Score · Total Reviews · New This Month
  - Negative Reviews · Unanswered Reviews · Response Rate · Avg Response Time
  - Resolved Complaints · Follower Count · Profile Views This Month · Search Appearances
- `[WEB]` Trust score sparkline (last 30 days)

### 5.6 Owner Review Management `[MED]`

- `[WEB]` Owner reviews tab filters: by rating (1–5), unanswered only, negative only, resolved, has evidence, date range
- `[WEB]` Review row actions: Reply · Use Template · Mark Resolved · Request More Details

### 5.7 Template Auto-Suggestion `[MED]`

`ResponseTemplate` has `sentiment` field — use it:

- `[WEB]` Reply modal: auto-suggest templates based on review `overallRating`:
  - 1–2 stars → `sentiment = 'negative'` templates first
  - 5 stars → `sentiment = 'positive'` templates first
- `[WEB]` Template preview on hover; one-click insert into reply body

### 5.8 Review Invite Enhancement `[MED]`

`ReviewInvite` fields `maxUses`, `expiresAt`, `openCount`, `useCount` exist but aren't surfaced:

- `[DB]` Add to `ReviewInvite`: `channel String? @db.VarChar(30)`, `conversionReviewId String? @db.Uuid @map("conversion_review_id")`
- `[API]` `POST /entities/:id/invites` — accept `maxUses?`, `expiresAt?`, `label?`
- `[WEB]` Invites page: per-invite stats (opens, conversions, status, expiry)
- `[WEB]` Invite creation form: `maxUses`, `expiresAt`, `label` fields
- `[WEB]` QR code generation (client-side `qrcode` npm package)
- `[WEB]` WhatsApp share: `https://wa.me/?text=Review us: ${inviteUrl}`
- `[WEB]` Copy link button

### 5.9 Analytics Export `[LOW]`

- `[API]` `GET /owner/entities/:id/analytics/export?format=csv&from=&to=`
- `[API]` `GET /owner/entities/:id/reviews/export?format=csv`
- `[WEB]` Owner analytics tab: "Export CSV" button

---

## Phase 6 — Streaks, Badges & Gamification Polish *(2 weeks)*

**Goal:** Reward quality actions, not passive visits. Add shields and milestones.

### 6.1 Streak Quality Weighting `[HIGH]`

Reward meaningful actions more than passive behavior:

- `[API]` New `activityType` values for `POST /review-streaks/activities`:
  - `review_with_evidence` (3× points)
  - `community_validation` (2× points)
  - `constructive_comment` (1×, body ≥50 chars required)
  - `report_confirmed` (2×, auto-triggered when mod confirms)
  - `profile_completed` (one-time 5× bonus)
  - `detailed_review` (2×, quality score ≥0.7)
- Reduce points for `feed_visit` and `active_time` — passive signals, low reward

### 6.2 Streak Shield / Freeze `[HIGH]`

- `[DB]` Add to `ReviewStreak`: `shieldCount Int @default(0) @map("shield_count")`, `shieldUsedAt DateTime? @map("shield_used_at")`
- `[API]` Streak service: if user misses a day, auto-consume a shield if `shieldCount > 0` before resetting streak
- `[API]` Auto-award shield at 7-day and 30-day milestones
- `[WEB]` Streaks dashboard: show shield count + "You can earn more shields by maintaining streaks" explanation

### 6.3 Following Leaderboard `[MED]`

- `[API]` `GET /review-streaks/leaderboard?scope=following` — filter by followed users
- `[WEB]` Streaks/reputation page: leaderboard tabs (Global · People I Follow)

### 6.4 Streak Milestone Badge Wiring `[MED]`

`Badge` model has `streak_7`, `streak_30` types — wire them:

- `[API]` Streak service: on milestone hit, auto-award badge internally, emit `badge_awarded` notification
- `[WEB]` Milestone celebration: confetti + "You earned a badge!" modal on first milestone hit

### 6.5 Reputation Dashboard Page `[LOW]`

Merge `/dashboard/badges` + `/dashboard/streaks` into unified page:

- `[WEB]` New route `/dashboard/reputation`:
  - Current Streak · Longest Streak · Shield Count · Contribution Score
  - Badge Grid · Global Rank · Following Rank · Next Milestone progress bar
- `[WEB]` Redirect `/dashboard/badges` and `/dashboard/streaks` → `/dashboard/reputation`

---

## Phase 7 — Follows, Notifications & Reputation *(3–4 weeks)*

**Goal:** Expand social graph, make notifications useful and controllable, make user reputation visible.

### 7.1 Expand Follow Target Types `[BLOCKER]`

- `[DB]` Update `FollowTargetType` enum:
  ```prisma
  enum FollowTargetType {
    entity
    category
    city        // new
    user        // new
    tag         // new (WarningTag key)
    discussion  // new
  }
  ```
- `[API]` `POST /follows` — validate per `targetType` (e.g. for `city`, `targetId` must be valid city UUID; for `tag`, must be valid tag key)
- `[API]` `GET /me/follows` — return grouped by `targetType` with resolved display names
- `[API]` `GET /users/:id/followers` · `GET /users/:id/following`
- `[WEB]` User profile page: Follow button; followers/following counts
- `[WEB]` City search results / city landing pages: "Follow this city" option
- `[WEB]` Tag chips on review cards: "Follow this tag" option
- `[WEB]` Discussion cards: "Follow discussion" option

### 7.2 User Follow — Feed & Notifications `[HIGH]`

- `[API]` Feed personalization: ensure `GET /feed/me` includes `FeedItem` from followed users' reviews + discussions
- `[API]` Notification trigger: when followed user publishes review, emit `new_review_on_followed` notification

### 7.3 Follow Recommendations `[HIGH]`

- `[API]` `GET /recommendations/follows` — based on `OnboardingPreference.categoryKeys` + user's city:
  - Top-rated entities in those categories in user's city
  - Popular reviewers (users) in those categories
  - Trending tags in those categories
- `[WEB]` Post-onboarding: "Suggested for you" step before redirect to `/feed`
- `[WEB]` Empty `/feed` state for new users: follow recommendations widget

### 7.4 User Reputation Score `[HIGH]`

- `[DB]` New model:
  ```prisma
  model UserReputationScore {
    id                      String   @id @default(uuid()) @db.Uuid
    userId                  String   @unique @map("user_id") @db.Uuid
    publishedReviews        Int      @default(0) @map("published_reviews")
    helpfulVotesReceived    Int      @default(0) @map("helpful_votes_received")
    evidenceBackedReviews   Int      @default(0) @map("evidence_backed_reviews")
    communityConfirmations  Int      @default(0) @map("community_confirmations")
    acceptedReports         Int      @default(0) @map("accepted_reports")
    resolvedIssues          Int      @default(0) @map("resolved_issues")
    removedReviews          Int      @default(0) @map("removed_reviews")
    confirmedSpam           Int      @default(0) @map("confirmed_spam")
    totalScore              Int      @default(0) @map("total_score")
    recalculatedAt          DateTime @default(now()) @map("recalculated_at")
    user User @relation(fields: [userId], references: [id])
    @@map("user_reputation_scores")
  }
  ```
- Formula: `publishedReviews + helpfulVotesReceived + (evidenceBackedReviews × 2) + communityConfirmations + (acceptedReports × 2) + resolvedIssues - (removedReviews × 3) - (confirmedSpam × 5)`
- `[API]` `GET /users/:id/reputation` — public reputation summary
- `[WEB]` Public user profile: show reputation score + contributor level

### 7.5 Notification Preferences `[HIGH]`

- `[DB]` New model:
  ```prisma
  model NotificationPreference {
    id        String   @id @default(uuid()) @db.Uuid
    userId    String   @unique @map("user_id") @db.Uuid
    prefsJson Json     @map("prefs_json")
    // per NotificationType: { enabled: boolean, channels: ('in_app'|'email')[] }
    updatedAt DateTime @updatedAt @map("updated_at")
    user User @relation(fields: [userId], references: [id])
    @@map("notification_preferences")
  }
  ```
- `[API]` `GET /me/notification-preferences` · `PATCH /me/notification-preferences`
- `[API]` All notification emit paths: check user preferences before sending
- `[WEB]` Notification preferences page at `/dashboard/notification-settings`

### 7.6 Notification UI Improvements `[HIGH]`

- `[WEB]` Notifications page: "Mark all as read" button (`PATCH /notifications/read-all`)
- `[WEB]` Notifications page: filter by type (reviews, discussions, claims, badges, system)
- `[WEB]` Notification grouping: collapse similar notifications ("3 people voted your review helpful")

### 7.7 My List Dashboard Page `[MED]`

Merge saved entities + all follows into a single organized page:

- `[WEB]` New route `/dashboard/my-list` with tabs:
  - Saved Entities
  - Followed Entities
  - Followed Categories
  - Followed Cities
  - Followed Users
  - Followed Tags
  - Followed Discussions
- `[WEB]` Redirect `/dashboard/saved` and `/dashboard/follows` → `/dashboard/my-list`

### 7.8 User Suspension Feedback `[MED]`

- `[API]` When admin suspends a user, emit notification with reason
- `[WEB]` Suspended users: show suspension reason + appeal contact on login attempt, not just a generic error

---

## Phase 8 — Moderation & Admin Operations *(2–3 weeks)*

**Goal:** Professional moderation. Proper queues, reason codes, action history, duplicate merge, legal escalation.

### 8.1 Moderation Route Fix `[BLOCKER]`

- `[WEB]` Move `/community/moderation` → admin portal at `/admin/moderation`
- `[WEB]` Remove moderation from community nav; make accessible only via header icon for `admin|super_admin|moderator` roles
- Admin portal already has `/moderation` — consolidate

### 8.2 Moderation Queues `[HIGH]`

- `[API]` `GET /admin/moderation/queues` — return queue counts summary
- `[API]` `GET /admin/moderation/cases?queue=reported_reviews|reported_discussions|reported_comments|duplicate_entities|claim_disputes|owner_abuse|suspicious_users|legal_sensitive`
- `[ADMIN]` Moderation home: queue cards showing counts per queue type
- `[ADMIN]` Bulk select + action (e.g. "Hide all selected reviews")

### 8.3 Reason Codes `[HIGH]`

- `[DB]` Add `reasonCode String? @map("reason_code") @db.VarChar(50)` to `ModerationAction`
  - Standard codes: `spam | fake_review | harassment | private_information | defamation_risk | wrong_entity | duplicate_content | conflict_of_interest | manipulated_votes | irrelevant_content | legal_sensitive`
- `[ADMIN]` Resolve case modal: required reason code dropdown + optional notes field

### 8.4 Moderation Case Action History `[HIGH]`

`ModerationAction` is in DB but not shown in admin UI:

- `[ADMIN]` Case detail: full `ModerationAction` timeline with actor, action type, reason code, notes, before/after state JSON diff
- `[ADMIN]` User detail: show moderation cases involving this user's content

### 8.5 Report → Case Escalation `[HIGH]`

- `[API]` `POST /admin/reports/:id/create-moderation-case` — promotes a report to a full moderation case
- `[ADMIN]` Report detail: "Escalate to Moderation Case" button

### 8.6 Duplicate Entity Admin Workflow `[HIGH]`

Wire the merge flow built in Phase 2.6 to admin UI:

- `[ADMIN]` Duplicates queue at `/admin/entities/duplicates`
- `[ADMIN]` Side-by-side comparison: name, category, city/locality, phone, address, review count, claims, followers, created date, trust score
- `[ADMIN]` Actions: Confirm Duplicate · Reject · Merge A into B · Merge B into A
- `[ADMIN]` Legal-sensitive cases: escalation modal with notice template

### 8.7 Claim Disputes Admin Queue `[MED]`

- `[ADMIN]` `/admin/claims/disputes` — list open disputes with entity + reporter info
- `[ADMIN]` Dispute detail: evidence URLs, claimant info, entity history, resolution form

### 8.8 User-Facing Report Actions `[MED]`

- `[WEB]` Review card: "Report wrong entity" option in report type selector
- `[WEB]` Review card: "Report private information" option
- `[WEB]` User's own hidden review: "Appeal" CTA that sends dispute to moderation queue

### 8.9 Entity Alias Management `[LOW]`

`EntityAlias` exists but has no admin UI:

- `[ADMIN]` Entity detail: Aliases tab — add, edit, delete aliases per `AliasType`

---

## Phase 9 — Growth, SEO & Campaigns *(2–3 weeks)*

**Goal:** Grow organic traffic and review collection loops after trust foundation is stable.

### Core Rule

> Growth features must support reputation and review collection, not random gamification.

### 9.1 City & Category Landing Pages `[HIGH]`

- `[WEB]` `/categories/[categoryKey]` — category landing page:
  - Top-rated entities · Most reviewed entities · Recent reviews · Common warning tags
  - "How to choose" guide section · FAQ block
- `[WEB]` `/cities/[citySlug]` — city landing page:
  - Top entities per category in this city · Recent reviews · Trending discussions
- `[WEB]` `/cities/[citySlug]/[categoryKey]` — city + category combo pages (highest SEO value)
- `[API]` `GET /cities/:citySlug` · `GET /cities/:citySlug/:categoryKey` — data endpoints for landing pages

### 9.2 SEO & Structured Data `[HIGH]`

- `[WEB]` Entity pages: `next/head` with full Open Graph + Twitter Card meta, JSON-LD `LocalBusiness` + `AggregateRating`
- `[WEB]` Review pages: JSON-LD `Review` schema
- `[WEB]` Blog pages: JSON-LD `Article` schema; wire existing `seoTitle`/`seoDescription` fields to `next/head`
- `[WEB]` Category/city landing pages: JSON-LD `Organization` + `BreadcrumbList` + `FAQPage`
- `[WEB]` `/robots.txt` — properly allow/disallow sections
- `[WEB]` `/sitemap.xml` — dynamic generation including entity pages, blog slugs, city/category landing pages

### 9.3 Entity Comparison Pages `[HIGH]`

- `[API]` `GET /entities/compare?ids=id1,id2,id3` — comparison payload for up to 3 entities
- `[WEB]` `/compare/[entityA]/vs/[entityB]` — side-by-side comparison page:
  - Rating, trust score, review count, response rate, resolution rate
  - Top positive tags, top warning tags, category-specific ratings
- `[WEB]` Entity page: "Compare with similar" CTA

### 9.4 Campaign Quality Rules `[MED]`

Keep campaigns but make them drive useful contributions:

- Good campaign examples: "Review Karachi clinics this week", "Best schools drive", "Report duplicate entities", "Helpful reviewer challenge"
- `[API]` Campaign create DTO: add `requiredReviewType?` and `requiredCategoryKey?` — campaigns must target specific contribution types
- `[WEB]` Campaign page: show what type of review is needed, not just generic join

### 9.5 Weekly Recap Notifications `[MED]`

- `[API]` Weekly job: send `weekly_recap` notification with: new reviews on followed entities, trust score changes, owner replies, top discussions, streak/badge updates
- `[WEB]` Notification card type: `weekly_recap` renders as a digest card

### 9.6 Owner Analytics Export `[MED]`

- `[API]` `GET /owner/entities/:id/analytics/export?format=csv&from=&to=`
- `[API]` `GET /owner/entities/:id/reviews/export?format=csv`
- `[WEB]` Owner analytics tab: "Export CSV" button
- Future: PDF monthly owner report via email

### 9.7 Admin Growth Dashboard `[MED]`

- `[API]` Add growth metrics to `GET /admin/dashboard`:
  - New users (daily/weekly/monthly) · New reviews · New entities
  - Claimed entities · Review invite conversions · SEO landing page visits
  - Top categories by review volume · Top cities by review volume
- `[ADMIN]` Dashboard: growth metrics section with period selector

---

## Phase 10 — Mobile PWA & Performance *(1–2 weeks)*

**Goal:** Fast, installable, mobile-first experience.

### 10.1 PWA `[HIGH]`

- `[WEB]` `manifest.json`: name, icons, theme color, `display: standalone`
- `[WEB]` Service worker: cache static assets, offline fallback page
- `[WEB]` "Add to Home Screen" prompt after 3rd visit

### 10.2 Image Optimization `[HIGH]`

- `[WEB]` All entity logos, covers, avatars: `next/image` with `priority` on above-fold content
- `[WEB]` Evidence gallery: lazy-load with blur placeholder
- `[API]` Upload service: enforce 5MB max, auto-compress via `sharp` before CDN storage

### 10.3 Bundle Performance `[MED]`

- `[WEB]` Category extension forms: `next/dynamic` import — only load employer/school/medical/product form when that category is selected
- `[WEB]` Discussion + review infinite scroll: virtualize with `@tanstack/react-virtual` for lists >50 items

---

## Phase 11 — Auth Extension & OAuth *(1–2 weeks)*

**Goal:** Reduce registration friction with social login.

### 11.1 Google OAuth `[HIGH]`

- `[API]` `POST /auth/google` — `{ idToken }` — verify with Google SDK, upsert user
- `[API]` Post-OAuth: if no `cityId` or `OnboardingPreference` → `requiresOnboarding: true` in response
- `[WEB]` Login + register: "Continue with Google" button
- `[WEB]` OAuth success with `requiresOnboarding: true` → redirect to `/onboarding`

### 11.2 Apple OAuth `[MED]`

- `[API]` `POST /auth/apple` — `{ identityToken, authorizationCode }`
- `[WEB]` Login + register: "Continue with Apple" (required for iOS App Store compliance)

### 11.3 Account Linking `[MED]`

- `[API]` `POST /me/link/google` — link Google to existing email account
- `[WEB]` Profile settings: "Linked accounts" section

---

## Phase 12 — Admin Portal Completeness *(1–2 weeks)*

**Goal:** Close all admin gaps from earlier phases.

- `[ADMIN]` Entity detail: Suggested Edits queue tab (Phase 2.5)
- `[ADMIN]` Entity detail: Duplicate Candidates tab (Phase 2.6)
- `[ADMIN]` Entity detail: Salary Submissions tab (Phase 2.9)
- `[ADMIN]` Entity detail: Aliases management tab (Phase 8.9)
- `[ADMIN]` Entity detail: Trust Event timeline (Phase 2.10)
- `[ADMIN]` Claims: verification level badge, document viewer, rejection reason + `resubmissionAllowed` toggle (Phase 5.1)
- `[ADMIN]` Claims: disputes queue at `/admin/claims/disputes` (Phase 5.2)
- `[ADMIN]` Users: `UserDevice` list + risk score on user detail (Phase 0.3)
- `[ADMIN]` Users: reputation score + contributor level on user detail (Phase 7.4)
- `[ADMIN]` Moderation: case action history timeline (Phase 8.4)
- `[ADMIN]` Moderation: reason code on resolve (Phase 8.3)
- `[ADMIN]` Analytics: entity comparison dashboard (Phase 9.3)
- `[ADMIN]` `POST /admin/trust/recalculate/:userId` + `GET /admin/trust/:userId/history` — wire to user detail
- `[ADMIN]` `POST /admin/badges/recalculate-user/:userId` + `POST /admin/badges/recalculate-entity/:entityId` — wire to user/entity detail

---

## Implementation Tracking Checklist

### Phase 0

- [ ] API client 429 + 403 + 5xx + network error handling
- [ ] Socket reconnect and room rejoin
- [ ] Optimistic UI for votes/follows/saves/reactions
- [ ] Feed scroll restoration
- [ ] Document login response shape (`requiresVerification` branch)
- [ ] Enforce `CommunityValidationType` in DTO
- [ ] Show `ReviewQualityScore` on review cards
- [ ] Show `IssueResolution` status on review cards
- [ ] `PATCH /notifications/read-all` wired in web
- [ ] Analytics fire-and-forget + debounce
- [ ] Onboarding re-entry in dashboard
- [ ] Invite create: accept maxUses/expiresAt/label
- [ ] Admin: session error boundary
- [ ] Admin: access denied page
- [ ] Admin: show UserDevice list on user detail

### Phase 1

- [ ] `POST /me/avatar` + `DELETE /me/avatar`
- [ ] `PATCH /me/password`
- [ ] `POST /me/change-email` + `POST /me/verify-change-email`
- [ ] `DELETE /me`
- [ ] `deactivatedAt` / `deletedReason` DB fields
- [ ] Username slug: expose in profile + check-availability endpoint
- [ ] `GET /users/:usernameOrId` public profile API
- [ ] `/users/[id]` public profile page
- [ ] `UserPrivacySettings` model + API
- [ ] Privacy settings UI in dashboard
- [ ] `contributorLevel` field on User + background job
- [ ] `POST /auth/request-phone-otp` + `POST /auth/verify-phone`
- [ ] Phone verification CTA in profile
- [ ] Standardized upload component with compression/preview/remove

### Phase 2

- [x] Entity DB fields: logo, cover, gallery, description, website, officialEmail, hours, socialLinks
- [x] `PATCH /entities/:id/profile` endpoint
- [x] `GET /entities/:id/trust-summary`
- [x] `GET /entities/:id/review-summary`
- [x] Entity page: Trust Overview + Review Summary sections
- [ ] Entity page tabs: About, Trust & Verification, Photos, Similar, Discussions
- [x] `EntitySuggestedEdit` model + APIs
- [x] Suggest edit CTA on entity page
- [x] `DuplicateCandidate` web surface: report duplicate CTA
- [x] `POST /admin/entities/duplicates/:id/merge` with full merge logic
- [x] `GET /entities/:id/similar`
- [x] Similar entities tab/section
- [x] Entity status badges on entity page
- [x] `EntityResponseMetric` shown publicly on entity page
- [x] `SalarySubmission` APIs + employer entity tab
- [x] `GET /entities/:id/trust/history` + timeline UI

### Phase 3

- [x] `reviewType` field on Review + form selector
- [x] `ReviewQualityScore` expanded fields + calculation job + labels
- [x] `ReviewUpdate` model + APIs + review timeline UI
- [x] `ReviewDraft` model + APIs + autosave
- [x] Review form: min body validation + character counter
- [x] Review form: category rating completion meter
- [x] Review form: preview step
- [x] `PATCH /reviews/:id` with evidence add/remove
- [x] Community validation 3-option picker UI
- [x] IssueResolution confirm/dispute UI
- [x] Admin review detail: quality panel + risk signals + timeline
- [x] Admin review actions: request_edit, mark_legal_sensitive, redact

### Phase 4

- [x] `FeedItem` + `FeedHide` DB models
- [x] Feed fan-out service
- [x] `GET /feed` + `GET /feed/me` from FeedItem
- [x] Feed card components per itemType
- [x] Feed tabs
- [x] `POST /feed/hide` API + card overflow menu
- [x] `DiscussionPost` new fields: type, entityId, categoryId, cityId, reviewId, tags, editedAt
- [x] `GET /entities/:id/discussions`
- [x] Discussion create form: entity/category/city link
- [x] Entity page: Discussions tab
- [x] `PATCH /discussions/:id` + `DELETE /discussions/:id`
- [x] `GET /discussions/search`
- [x] `DiscussionComment.parentCommentId` + threading UI
- [x] Community page redesign as reputation hub
- [x] Admin: convert discussion to moderation case

### Phase 5

- [x] `EntityClaim` new fields: verificationLevel, rejectionReason, resubmissionAllowed, expiresAt, revokedReason, transferRequestedToUserId
- [x] `business_email` + `document_upload` in ClaimVerificationMethod enum
- [x] Multi-step claim wizard
- [x] `POST /entities/:id/claims/:claimId/resubmit`
- [x] `ClaimDispute` model + APIs
- [x] `/owner/entities/[id]` route group
- [x] Redirect old owner-dashboard route
- [x] Owner action center API + UI
- [x] Owner KPIs grid
- [x] Owner review filters + actions
- [x] Template auto-suggestion in reply modal
- [x] `ReviewInvite.channel` + `conversionReviewId` fields
- [x] Invite: QR code, WhatsApp share, stats per invite
- [x] Analytics export endpoints

### Phase 6

- [x] New quality activityType values for streaks
- [x] `ReviewStreak.shieldCount` + shield logic
- [x] Following leaderboard
- [x] Milestone badge auto-award wired
- [x] `/dashboard/reputation` page
- [x] Redirect /badges + /streaks routes

### Phase 7

- [x] Expand `FollowTargetType` enum: city, user, tag, discussion
- [x] `GET /users/:id/followers` + `GET /users/:id/following`
- [x] Follow recommendations API + widget
- [x] `UserReputationScore` model + calculation
- [x] `NotificationPreference` model + API
- [x] Notification preferences page
- [x] Notification read-all + filter by type + grouping
- [x] `/dashboard/my-list` page with all follow types
- [x] Redirect /saved + /follows routes
- [x] User suspension notification with reason

### Phase 8

- [x] Move `/community/moderation` -> admin portal
- [x] `GET /admin/moderation/queues` endpoint
- [x] Queue tabs in admin moderation UI
- [x] `reasonCode` on ModerationAction + resolve form
- [x] Case action history timeline in admin
- [x] `POST /admin/reports/:id/create-moderation-case`
- [x] Duplicate merge admin UI (from Phase 2 APIs)
- [x] Claim disputes admin queue
- [x] User-facing: report wrong entity, report PII, appeal hidden review

### Phase 9

- [x] `/categories/[categoryKey]` landing pages
- [x] `/cities/[citySlug]` + `/cities/[citySlug]/[categoryKey]` landing pages
- [x] JSON-LD schemas on all public pages
- [x] Sitemap + robots.txt
- [x] `/compare/[entityA]/vs/[entityB]`
- [x] Campaign quality rules (requiredReviewType)
- [x] Weekly recap notification job
- [x] Owner analytics + reviews CSV export
- [x] Admin growth dashboard metrics

### Phase 10

- [x] PWA manifest + service worker
- [x] next/image optimization across all entities/avatars
- [x] Dynamic imports for category extension forms
- [x] Virtualized lists

### Phase 11

- [x] `POST /auth/google`
- [x] `POST /auth/apple`
- [x] `POST /me/link/google`
- [x] Login/register page social buttons

### Phase 12

- [x] All admin portal gap items (12 items listed above)

---

## Summary Table

| Phase | Name | DB Migrations | New API Endpoints (est.) | Duration |
|---|---|---|---|---|
| 0 | Foundation Hardening | 0 | ~5 | 1–2 weeks |
| 1 | User Identity & Profile | 3 | ~12 | 2–3 weeks |
| 2 | Entity Profile Richness | 3 | ~14 | 2–3 weeks |
| 3 | Reviews Quality & Lifecycle | 3 | ~10 | 3–4 weeks |
| 4 | Feed, Community & Discussions | 3 | ~12 | 3–4 weeks |
| 5 | Claims & Owner Dashboard | 3 | ~12 | 3–4 weeks |
| 6 | Streaks & Gamification | 1 | ~4 | 2 weeks |
| 7 | Follows, Notifications & Reputation | 3 | ~12 | 3–4 weeks |
| 8 | Moderation & Admin Ops | 1 | ~6 | 2–3 weeks |
| 9 | Growth, SEO & Campaigns | 1 | ~8 | 2–3 weeks |
| 10 | Mobile PWA & Performance | 0 | 0 | 1–2 weeks |
| 11 | OAuth & Auth Extension | 0 | ~5 | 1–2 weeks |
| 12 | Admin Portal Completeness | 0 | ~4 | 1–2 weeks |
| **Total** | | **~21 migrations** | **~104 endpoints** | **~28–38 weeks** |

---

## Recommended Execution Order

**Small team (2–3 devs) — strict sequence:**
```
0 → 1 → 2 → 3 → 5 → 4 → 8 → 6 → 7 → 9 → 10 → 11 → 12
```

**Parallel team (4–5 devs) — split streams:**
```
Stream A (Product/UX):       0 → 1 → 3 → 4 → 6 → 7 → 9
Stream B (Infra/API/Admin):  0 → 2 → 5 → 8 → 10 → 11 → 12
```

Phase 0 is always the prerequisite for both streams.

---

## Architecture & Coding Standards

When implementing any phase, follow these rules:

**Backend (NestJS)**
- Controllers handle HTTP routing and DTO validation only
- Services contain all business logic
- No raw Prisma calls in controllers
- Use DB transactions for multi-step writes (merge, claim approve, review create + quality score)
- Audit log entries for: claim approve/reject, user suspend/ban, entity merge, review remove, admin content actions
- All new endpoints need Swagger `@ApiOperation` + `@ApiResponse` decorators
- Keep API envelope stable: `{ success: true, data, timestamp }` / `{ success: false, error: { code, message, details?, requestId? }, timestamp, path }`

**Frontend (Next.js)**
- Keep guest read behavior on discovery pages
- Use protected routes for all authenticated actions
- Every mutation: loading state, error state, success state
- Mobile responsive — test at 375px width
- Old routes always redirect, never 404

**Admin portal**
- Every destructive action (remove, ban, merge, revoke) requires confirmation modal with consequence description
- Moderation, claims, and legal-sensitive actions require reason code
- Import flows must return row-level success/error counts, not just total

---

## Deferred / De-Scoped Items

| Item | Reason to Defer |
|---|---|
| Polls in discussions | New DB model; wait until discussion volume justifies it |
| In-app user messaging | Significant infra + privacy complexity; post-10k MAU |
| AI review summarization on entity page | Needs ML pipeline; not core trust feature |
| Advanced salary analytics | Needs large submission volume to be meaningful |
| Native mobile app | PWA (Phase 10) buys time; revisit after 10k MAU |
| Generic social "status" posts | Explicitly avoid — dilutes trust-network focus |
| Billing / paid owner plans | After free owner value is proven |
| Complex campaign leaderboard | Keep campaigns simple until core loop is proven |

---

*Each phase should be broken into a Jira/Linear epic with individual task tickets before implementation starts. Use `21-implementation-tracking.md` checkboxes as the source of truth for sprint planning.*

## Implementation Tracker (Live)

Last updated: 2026-04-29

### Phase 2 - Entity Profile Richness

- [x] 2.1 [DB] Entity metadata fields exist in schema (`logoUrl`, `coverImageUrl`, `galleryUrls`, `description`, `websiteUrl`, `officialEmail`, `businessHoursJson`, `socialLinksJson`, `alternatePhonesJson` surfaced)
- [x] 2.1 [API] `POST /entities` now accepts rich profile fields
- [x] 2.1 [API] `PATCH /entities/:id` now accepts rich profile fields
- [x] 2.1 [API] Added `PATCH /entities/:id/profile` for rich profile-only updates
- [x] 2.1 [ADMIN] Entity create/edit forms updated with rich profile fields
- [x] 2.1 [ADMIN] Entities bulk template/parser updated with rich profile columns
- [x] 2.1 [WEB] Entity page header now renders cover/logo + website/social/contact details
- [x] 2.1 [WEB] Entity about section now renders business hours + gallery

### Next Up (Phase 2.2)

- [x] Implement `GET /entities/:id/trust-summary`
- [x] Render trust overview KPI section on web entity page
- [x] Add response-rate labels (`Highly Responsive`, `Active Owner`, `Low Response Rate`)

### Next Up (Phase 2.3)

- [x] Implement `GET /entities/:id/review-summary`
- [x] Render review summary section above reviews tab

### Next Up (Phase 2.4)

- [x] Entity status visibility chips/banners for `claimed`, `under_review`, `suspended`
- [ ] `merged` canonical redirect/message flow (depends on duplicate merge implementation in 2.6)

### Phase 6 - Streaks & Gamification (Completed)

- [x] Quality-weighted streak activity types wired in API + web tracking hooks
- [x] Shield freeze logic (`shieldCount`, consume-on-break, auto-award milestones) implemented
- [x] Following leaderboard endpoint and web tab implemented
- [x] Unified `/dashboard/reputation` delivered
- [x] `/dashboard/badges` and `/dashboard/streaks` now redirect to `/dashboard/reputation`

### Phase 7 - Follows, Notifications & Reputation (Completed)

- [x] Follow target type expansion (city, user, tag, discussion) shipped end-to-end
- [x] Followers/following APIs and profile follow surfaces implemented
- [x] Follow recommendations API + feed recommendation widget enabled
- [x] `UserReputationScore` model/service integrated and surfaced
- [x] Notification preferences API + settings page delivered
- [x] Notification page includes read-all, type filters, grouped rendering
- [x] `/dashboard/my-list` now merges saved entities + all follow types
- [x] `/dashboard/saved` and `/dashboard/follows` redirect to `/dashboard/my-list`
- [x] Suspension reason feedback shown on login when account is suspended/banned

### Phase 8 - Moderation & Admin Ops (Completed)

- [x] Community moderation moved out of community actions; admin portal is the moderation surface
- [x] Moderation queue summary endpoint + queue filtering implemented
- [x] Admin moderation resolve flow includes reason code capture
- [x] Moderation action history timeline is visible in case detail
- [x] Report escalation endpoint + admin trigger wired
- [x] Duplicate candidate queue + merge workflows wired in admin
- [x] Claim disputes queue + detail actions shipped
- [x] User report flow includes wrong-entity + private-information + hidden-review appeal paths
- [x] Entity alias management available in admin entity detail

### Phase 9 - Growth, SEO & Campaigns (Completed)

- [x] Category and city landing pages implemented (`/categories/[categoryKey]`, `/cities/[citySlug]`, `/cities/[citySlug]/[categoryKey]`)
- [x] Structured data (JSON-LD) added across landing/content pages including city/category/blog/entity
- [x] Dynamic `robots.txt` + `sitemap.xml` implemented
- [x] Entity comparison route support includes `/compare/[entityA]/vs/[entityB]` redirect compatibility
- [x] Campaign quality fields (`requiredReviewType`, `requiredCategoryKey`) wired in API + web
- [x] Weekly recap notification job and web digest rendering implemented
- [x] Owner analytics/reviews CSV export endpoints + UI wiring completed
- [x] Admin growth dashboard expanded with period selector and growth distribution metrics

### Phase 10 - Mobile PWA & Performance (Completed)

- [x] PWA manifest, service worker, offline page, and install prompt added
- [x] `next/image` migration completed for web app image surfaces
- [x] Evidence/gallery media now uses blur placeholders and lazy behavior
- [x] Upload pipeline enforces 5MB limits and image compression via `sharp`
- [x] Dynamic category form imports and virtualized feed/discussion lists implemented

### Phase 11 - OAuth & Auth Extension (Completed)

- [x] `POST /auth/google` implemented with social account upsert/linking flow
- [x] `POST /auth/apple` implemented with token validation flow
- [x] `POST /me/link/google` implemented for account linking
- [x] Login/register social actions and onboarding redirect handling delivered

### Phase 12 - Admin Portal Completeness (Completed)

- [x] Entity detail includes suggested edits, duplicates, salary submissions, aliases, trust timeline
- [x] Claims detail includes verification level display, evidence viewer, rejection reason/resubmission controls
- [x] Claims disputes queue routed and actionable in admin
- [x] User detail includes devices, risk score, reputation, contributor level, trust/badge recalc actions
- [x] Moderation detail includes reason-code-aware resolve flow + action timeline
- [x] Analytics comparison dashboard delivered and linked in admin navigation


