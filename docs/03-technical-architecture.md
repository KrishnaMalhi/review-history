# 03 — Technical Architecture

## 1. Architecture Goals

- fast MVP execution
- clean evolution path
- strong moderation and auditability
- high trust and abuse resistance
- easy future split into services

## 2. Recommended Stack

### Frontend Web
- Next.js
- TypeScript
- Tailwind CSS
- React Query or TanStack Query
- Zustand for light client state
- next-intl for i18n
- Zod for runtime validation

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis for rate limits, queues, cache
- BullMQ for background jobs

### Infra
- Docker
- Nginx or managed edge
- object storage for images/evidence metadata
- CDN
- managed Postgres preferred
- logging + metrics + tracing stack

### Search
MVP options:
- PostgreSQL full text + trigram similarity
- later Meilisearch / OpenSearch / Elasticsearch

### Auth / OTP
- phone OTP gateway
- JWT access token + rotating refresh token
- device/session tracking

## 3. High-Level System Design

```text
[Web / Mobile Web]
        |
        v
   [API Gateway / BFF]
        |
        +-----------------------------+
        |                             |
        v                             v
 [Auth & Identity]            [Core Review Domain]
        |                             |
        |                             +--> Entities
        |                             +--> Reviews
        |                             +--> Replies
        |                             +--> Tags / Warnings
        |                             +--> Claims
        |                             +--> Trust Score
        |                             +--> Moderation
        |
        +--> OTP / Sessions / Devices

        +-----------------------------+
        |                             |
        v                             v
 [Fraud / Risk Engine]         [Search / Discovery]
        |
        +--> IP/device heuristics
        +--> duplicate detection
        +--> suspicious activity scoring

        +-----------------------------+
        |                             |
        v                             v
 [Admin Console]                [Analytics / Reporting]
```

## 4. Recommended Backend Modules

- auth
- users
- sessions
- entities
- categories
- tags
- reviews
- replies
- claims
- moderation
- reports
- duplicate-detection
- trust-score
- risk
- notifications
- analytics
- admin
- billing
- content-pages
- audit-log

## 5. Core Domain Design Principles

### 5.1 Entity-first
Entities exist independently of claimants.

### 5.2 Evented recalculation
Trust score, duplicate checks, and fraud signals should update asynchronously after core writes.

### 5.3 Full auditability
Every moderation decision and major state change should be logged.

### 5.4 Hard constraints + soft heuristics
Use database constraints where possible and risk scoring where necessary.

## 6. Deployment Topology

### MVP
- one frontend app
- one backend app
- one Postgres
- one Redis
- one worker process
- one admin panel (same codebase or separate route group)

### Scale-up
- split public API and admin API
- dedicated search cluster
- separate moderation/risk worker tier
- read replicas
- queue partitioning

## 7. Data Flow Examples

### Review submission
1. user authenticates with OTP
2. rate-limit check
3. entity lookup
4. one-review-per-entity rule check
5. review write
6. moderation pre-check
7. trust score recalculation job
8. suspicious pattern analysis job
9. entity aggregates updated
10. notifications sent if required

### Claim flow
1. claimant requests claim
2. phone or manual verification
3. reviewable evidence submission
4. admin/rules decision
5. claim state updated
6. claimant gains reply privileges

## 8. Non-Functional Requirements

- p95 read latency under 400 ms on major pages
- idempotent critical write endpoints
- strong audit logs
- queue retry safety
- recoverable moderation actions
- full observability
- privacy by design

## 9. Why Not Microservices Initially

A modular monolith is preferable because:
- faster build
- lower ops cost
- easier schema iteration
- easier consistency and transactions
- simpler moderation and trust model coordination

## 10. Evolution Path

### Stage 1
Modular monolith

### Stage 2
Extract:
- notifications
- search
- analytics
- billing

### Stage 3
Extract:
- risk engine
- trust score service
- moderation decision engine
