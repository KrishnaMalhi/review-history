# System Implementation Documentation

## 1. Recommended Architecture

For a side project with serious long-term potential, use a **modular monolith** first.

Why:
- much faster to ship,
- easier debugging,
- lower infra cost,
- simpler local development,
- clean path to later service extraction.

## 2. Architecture Style

- Backend: modular monolith with domain modules
- Frontend: app-based web platform first
- API: REST first, optional internal events
- Data: PostgreSQL
- Cache/queue: Redis
- Search: PostgreSQL full-text first, Elastic/OpenSearch later if needed
- Storage: S3-compatible object storage for media and documents

## 3. Core Modules

## Auth & Identity
- phone OTP auth
- session/token handling
- device/session tracking
- abuse throttling

## Users
- profile
- account status
- trust metadata
- sanctions

## Entities
- create/search/edit
- duplicates
- aliases
- claim management
- location fingerprinting

## Categories
- category tree
- templates
- question sets
- tags

## Reviews
- write/read/edit
- star ratings
- sub-ratings
- media support later
- review states

## Trust Engine
- score calculation
- quality score
- confidence scoring
- fraud indicators
- ranking signals

## Voting & Community Signals
- helpful vote
- same-experience vote
- seems-fake vote
- brigading detection

## Moderation
- reports
- queues
- actions
- appeals
- audit trail

## Replies & Claims
- owner reply
- claim request
- proof submission
- approval flow

## Search & Discovery
- query parsing
- facets
- ranking
- related entities
- SEO pages

## Notifications
- SMS/OTP
- email optional
- in-app notifications

## Admin
- moderation console
- entity tools
- merge tools
- legal request tools
- metrics

## 4. Suggested Backend Folder Structure

```text
src/
  app.module.ts
  common/
    config/
    auth/
    guards/
    interceptors/
    decorators/
    utils/
  modules/
    auth/
    users/
    entities/
    entity-claims/
    categories/
    reviews/
    votes/
    reports/
    moderation/
    trust/
    search/
    notifications/
    admin/
    audit/
  infra/
    prisma/
    redis/
    sms/
    storage/
    queue/
```

## 5. Suggested Core Database Tables

- users
- phone_verifications
- user_sessions
- entities
- entity_aliases
- entity_locations
- entity_claims
- categories
- category_templates
- reviews
- review_dimension_scores
- review_votes
- review_reports
- moderation_cases
- moderation_actions
- duplicate_suggestions
- entity_merges
- public_replies
- trust_scores
- trust_events
- audit_logs
- notifications
- rate_limits

## 6. Important Database Constraints

- unique on normalized phone
- unique on `(user_id, entity_id)` for one active review per entity
- unique canonical alias mapping
- soft-delete everywhere reasonable
- immutable audit rows
- review state index
- entity search indexes
- location normalization indexes

## 7. Review Submission Pipeline

1. authenticate user
2. check review eligibility
3. validate schema
4. sanitize text
5. run content rules
6. run abuse heuristics
7. persist review
8. create moderation flags if needed
9. publish or hold
10. recalculate trust
11. emit events

## 8. Duplicate Detection Pipeline

Inputs:
- normalized name
- category
- city
- area
- phone
- address tokens

Methods:
- exact normalized comparisons
- trigram/fuzzy matching
- location overlap
- phone equality
- alias similarity

Outputs:
- duplicate confidence score
- suggested canonical entity ids

## 9. Trust Score Pipeline

Inputs:
- review aggregates
- review quality
- moderation history
- suspicious pattern count
- helpful/fake votes
- owner responsiveness

Outputs:
- trust score
- confidence level
- warning tags
- ranking score

## 10. Search Ranking Strategy

MVP rank order:
1. exact name relevance
2. location/category relevance
3. trust score confidence
4. review count
5. recency of meaningful reviews
6. claimed profile completeness as a minor factor only

Never let “claimed” outrank trust.

## 11. API Design Areas

### Public
- search entities
- view entity
- view reviews
- view replies
- view category pages

### Authenticated
- login by phone
- add entity
- add review
- vote
- report
- save/watch entity

### Claimed Owner
- claim entity
- reply to reviews
- update approved profile fields
- view analytics

### Admin
- moderation queue
- merge entities
- sanction user
- legal request processing

## 12. Non-Functional Requirements

- auditability
- rate limiting
- resilient OTP provider handling
- low-cost hosting for MVP
- observability
- rollback-safe moderation
- backup and restore
- PII minimization

## 13. Scaling Path

### Phase 1
Single app server + PostgreSQL + Redis

### Phase 2
Separate worker processes for:
- trust recomputation
- moderation jobs
- notification jobs

### Phase 3
Add:
- search engine,
- analytics warehouse,
- media processing,
- regionalization.

## 14. Why This Architecture Fits the Product

This product is not just CRUD.  
It needs:
- identity controls,
- moderation workflows,
- trust computation,
- duplicates management,
- public transparency,
- policy enforcement.

A modular monolith gives enough rigor without premature complexity.
