# ReviewHistory — Technical Architecture

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────────────────┐    ┌────────────────────────────┐ │
│  │   Next.js 14 Web App │    │  React Native + Expo App   │ │
│  │   (Vercel CDN)       │    │  (iOS + Android)           │ │
│  │   SSR + SSG for SEO  │    │  expo-router navigation    │ │
│  └──────────┬───────────┘    └──────────────┬─────────────┘ │
└─────────────┼────────────────────────────────┼──────────────┘
              │  REST API calls                │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                               │
│            NestJS REST API (Railway.app)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │ Entities │ │ Reviews  │ │    Search    │  │
│  │  Module  │ │  Module  │ │  Module  │ │    Module    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────────────┐  │
│  │  Upload  │ │  Admin   │ │  Trust Score Calculator   │  │
│  │  Module  │ │  Module  │ │  (packages/utils)         │  │
│  └──────────┘ └──────────┘ └───────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────────┐
         ▼                ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │  Cloudinary  │  │     Twilio       │
│  (Railway)   │  │  (Photos)    │  │  (SMS / OTP)     │
│  Prisma ORM  │  │  Free tier   │  │  ~$10/month      │
└──────────────┘  └──────────────┘  └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend: Next.js 14 (App Router)

**Why Next.js?**
- SSR/SSG is critical — "Dr. Ahmed Johar Town reviews" MUST rank on Google
- App Router enables server components for faster initial loads
- Built-in API routes for lightweight actions
- Vercel deployment: free tier, global CDN, automatic HTTPS
- Tailwind CSS for rapid, consistent UI development

**Key pages and their rendering strategy:**

| Page | Rendering | Reason |
|------|-----------|--------|
| Home | SSG | Static, cached globally |
| Entity detail `/entities/[slug]` | ISR (60s) | SEO critical, frequently updated |
| Search results | SSR | Dynamic query params |
| User profile | CSR | Protected, personal |
| Admin dashboard | CSR | Protected, real-time |

### Backend: NestJS

**Why NestJS?**
- TypeScript-first — same language across entire monorepo
- Modular architecture — Auth, Entities, Reviews are independent modules
- Built-in decorators, guards, pipes reduce boilerplate
- Swagger auto-generates API documentation
- Dependency injection makes testing easy

**NestJS Module Map:**

```
AppModule
├── AuthModule       → OTP send/verify, JWT generation, profile
├── EntitiesModule   → CRUD, claim, flag duplicate
├── ReviewsModule    → CRUD, vote, report, owner reply
├── SearchModule     → Full-text search with PostgreSQL tsvector
├── UploadModule     → Cloudinary image upload
├── AdminModule      → Reports, ban, merge, stats
└── CategoriesModule → Category list, warning tag list
```

### Database: PostgreSQL + Prisma

**Why PostgreSQL?**
- Full-text search with `tsvector` for entity name search
- ACID compliance ensures review integrity
- `ILIKE` for case-insensitive Pakistani name search
- Railway.app offers affordable managed PostgreSQL

**Why Prisma?**
- Type-safe database client (TypeScript)
- Automatic migrations from schema changes
- Excellent IDE autocomplete
- Prevents SQL injection by design

### Mobile: React Native + Expo

**Why Expo?**
- Single codebase for iOS and Android
- Managed workflow — no native Xcode/Android Studio required
- Expo Router for file-based navigation (same mental model as Next.js)
- `expo-secure-store` for encrypted JWT storage

**Mobile screen map:**

```
(tabs)/
├── index          → Home feed + search
├── search         → Search with filters
├── profile        → User profile + reviews written
└── notifications  → New reviews on saved entities

entities/
├── [id]           → Entity detail + reviews
└── add            → Add new entity form

reviews/
└── add/[entityId] → Multi-step review form
```

### Monorepo: Turborepo + pnpm

**Why monorepo?**
- Share `@reviewhistory/db` (Prisma client) across all apps
- Share `@reviewhistory/types` (TypeScript interfaces) — write once, use everywhere
- Share `@reviewhistory/utils` (trust score, anti-fake functions)
- Parallel builds with intelligent caching
- Single `pnpm dev` command runs all services

---

## 📦 Complete Monorepo Structure

```
review-history/
├── apps/
│   ├── web/              # Next.js 14 (App Router)
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # API client, helpers
│   │   └── public/       # Static assets
│   ├── api/              # NestJS REST API
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── entities/
│   │   │   ├── reviews/
│   │   │   ├── search/
│   │   │   ├── upload/
│   │   │   └── admin/
│   │   └── test/
│   └── mobile/           # React Native + Expo
│       ├── app/          # Expo Router screens
│       ├── components/
│       └── lib/
├── packages/
│   ├── db/               # Prisma schema + client singleton
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       └── index.ts  # Prisma client singleton
│   ├── types/            # Shared TypeScript interfaces
│   │   └── src/
│   │       ├── entity.types.ts
│   │       ├── review.types.ts
│   │       ├── user.types.ts
│   │       └── index.ts
│   └── utils/            # Trust score, anti-fake, formatters
│       └── src/
│           ├── trust-score.ts
│           ├── anti-fake.ts
│           ├── formatters.ts
│           └── index.ts
├── docs/                 # All documentation (this folder)
├── turbo.json            # Turborepo pipeline config
├── pnpm-workspace.yaml   # pnpm workspaces
├── package.json          # Root scripts
└── .env.example          # All environment variables
```

---

## 🚀 Deployment Architecture

| Service | Platform | Tier | Cost/Month |
|---------|----------|------|------------|
| Web Frontend | Vercel | Free (Hobby) | $0 |
| API Backend | Railway | Starter | $5 |
| PostgreSQL DB | Railway | Starter | $5 |
| Photo Storage | Cloudinary | Free | $0 |
| SMS / OTP | Twilio | Pay-as-go | ~$10 |
| Domain (.pk) | Namecheap | Annual | ~$1 |
| **Total** | | | **~$21/month** |

---

## 🔄 Review Submission Data Flow

```
1.  User submits review form (web/mobile)
2.  Request hits NestJS API with JWT token
3.  JWT Guard validates token → extracts userId
4.  DTO validation pipe validates all fields
5.  ReviewsService.create() called
6.  Anti-fake checks run:
      - Is account < 24 hours old?  → status = PENDING
      - 3+ reviews from same IP?    → status = FLAGGED
      - Review text < 20 chars?     → Rejected (400)
7.  Prisma creates review record in PostgreSQL
8.  TrustScore recalculated for entity
9.  Entity avgRating and totalReviews updated
10. Response returned to client
11. Client shows "Review published!" message
```

---

## 🔒 Security Overview

- JWT authentication (HS256, 7-day expiry)
- Phone OTP via Twilio (5-min expiry, max 3 attempts)
- IP addresses stored as HMAC-SHA256 hashes (never raw)
- All queries via Prisma (no SQL injection possible)
- Rate limiting on all sensitive endpoints
- Input sanitization via `class-validator` + `sanitize-html`
- See full details: [Security Documentation](./11-security-docs.md)

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/reviewhistory"

# JWT
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRES_IN="7d"

# Twilio OTP
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_FROM_NUMBER="+1234567890"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# App
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Anti-fake
IP_HASH_SECRET="another-256-bit-secret"
```

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Web page load (LCP) | < 2.5s |
| Mobile app TTI | < 3s |
| Database query (avg) | < 50ms |
| Uptime SLA | 99.9% |
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
