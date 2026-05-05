# Phase 8 Implementation Audit - 2026-05-04

Scope: `docs/reviewhistory-final-plan-v3.md` Phase 8, audited subsection-by-subsection against API, admin, and web implementation.

## 8.1 Moderation Route Fix

- Status: Implemented.
- Evidence: No public `/community/moderation` route exists in web. Web header exposes admin access only for `admin`, `super_admin`, and `moderator` roles.

## 8.2 Review Bombing Incident Management

- Status: Implemented in this pass.
- Added `ReviewBombingIncident` Prisma model and migration.
- Added review-save velocity detection: current 24h review volume above 3x prior daily average, with a minimum operational threshold, creates an incident.
- Added trust-weight reduction by marking affected reviews `underVerification` and `riskState: under_verification`.
- Added high-severity moderation case and `community_alert` feed item on incident creation.
- Added admin incident endpoints: list, detail, hold affected reviews, release affected reviews, resolve incident.
- Added admin incident list/detail UI with affected review list and bulk hold/release/resolve actions.

## 8.3 Moderation Queues

- Status: Implemented in this pass, with existing base queue retained.
- Expanded `GET /admin/moderation/queues` to include reported discussions, reported comments, owner abuse, suspicious users, auto-flagged, bombing incidents, and correction requests.
- Expanded moderation case `queue` filter enum to include `auto_flagged`, `bombing_incidents`, and `correction_requests`.
- Added admin queue cards for all sub-queues.
- Added bulk case selection and bulk keep/hide actions.

## 8.4 Reason Codes & Action History

- Status: Implemented.
- `ModerationAction.reasonCode` already existed.
- Added missing reason codes: `review_bombing`, `pii_leaked`, `competitor_mention`.
- Made `reasonCode` required for case resolution.
- Admin case detail already contained action timeline; updated reason choices to cover full Phase 8 set.
- User detail already links to moderation cases involving the user.

## 8.5 Policy Engine

- Status: Implemented in this pass.
- Added global Nest `PolicyService` with `canReview`, `canReply`, `canClaim`, `canVote`, and `reviewRequiresVerification`.
- Integrated policy checks into review creation, replies, claims, and voting.
- Policy reads `PlatformConfig` keys for review limits, interval, phone verification, low-trust verification, and flagged entity thresholds.

## 8.6 Report Escalation

- Status: Already implemented.
- API has `POST /admin/reports/:id/create-moderation-case`.
- Admin hooks and report detail escalation flow are present.

## 8.7 Duplicate Entity Admin Workflow

- Status: Already implemented.
- Admin duplicates queue and API merge/confirm/reject endpoints exist.
- Entity detail links to duplicate queue and shows duplicate candidates.

## 8.8 User-Facing Report Additions

- Status: Implemented in this pass.
- Web review report options now use valid API enum values, including `wrong_entity` and `personal_information`.
- Added hidden/under-verification/removed own-review appeal endpoint and dashboard CTA.
- Added entity page ownership report option using suggested-edit moderation flow.

## 8.9 Evidence Redaction in Moderation

- Status: Implemented in this pass.
- Added `EvidenceItem.redactedUrl`.
- Admin evidence action can store redacted URL.
- Admin evidence action can change visibility to `private_admin` or `private_owner_on_consent`.

## 8.10 Entity Alias Management

- Status: Implemented in this pass.
- Existing alias add/delete flow was present.
- Added API and admin UI support for editing aliases.

## Verification

- Regenerated Prisma client with `npx prisma generate --schema prisma/schema.prisma --no-engine`.
- API typecheck passed: `npx tsc --noEmit`.
- Admin typecheck passed: `npx tsc --noEmit`.
- Web typecheck passed: `npx tsc --noEmit`.
