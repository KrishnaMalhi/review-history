# Tech Stack Documentation and MVP Build Plan

## 1. Recommended Stack for This Product

Because this should be a serious side project with a path to production, the stack should optimize for:
- development speed,
- maintainability,
- clean architecture,
- low infra cost,
- strong typing,
- future modular growth.

## 2. Recommended Stack

## Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form + Zod**
- **TanStack Query**

Why:
- fast iteration,
- SSR/SEO support,
- strong DX,
- good fit for public profile pages and local SEO.

## Backend
- **NestJS**
- **TypeScript**
- **REST API**
- **Prisma ORM**
- **PostgreSQL**
- **Redis**

Why:
- structured architecture,
- good fit for domain modules,
- strong typing end-to-end,
- suitable for trust/moderation workflows.

## Infra
- **Docker**
- **Nginx**
- **PostgreSQL managed or self-hosted**
- **Redis**
- **S3-compatible storage**
- **SMS provider for OTP**
- **Basic worker queue**

## Admin / Observability
- **Sentry**
- **structured logging**
- **PostHog or similar product analytics**
- **cron/queue dashboard**
- **database backups**

## 3. Why This Stack Fits You

This stack suits a solo technical founder who wants:
- a serious codebase,
- a fast MVP,
- strong future extensibility,
- easy refactoring into a larger platform.

It also aligns well with a React + TypeScript + Node/Nest/Next orientation.

## 4. Recommended Repositories

For a side project, choose one of these:

### Option A — Separate frontend and backend
- `reputation-platform-web`
- `reputation-platform-api`

Best if you want cleaner deployment and architecture separation.

### Option B — Monorepo
- web + api + shared package

Best if you want faster shared typing initially.

For your stated preference in similar projects, **separate frontend and backend** is a strong choice.

## 5. MVP Build Plan

## MVP Objective
Launch a usable trustable review platform, not a feature-complete ecosystem.

## Must-have MVP features
- phone OTP login
- search entities
- add entity
- add review
- view entity page
- report abuse
- claim entity
- owner public reply
- basic moderation
- basic trust score
- basic duplicate prevention

## Nice-to-have, not required for launch
- advanced dashboards
- native mobile app
- media uploads
- advanced machine learning
- multilingual UI
- advanced ad system

## 6. Suggested MVP Screens

### Public
- home/search
- search results
- entity detail
- category pages
- city/area pages

### Authenticated
- write review
- add entity
- my reviews
- report content

### Claimed owner
- claim profile
- owner dashboard
- reply center

### Admin
- review queue
- reports queue
- duplicate queue
- claim queue

## 7. Suggested API Groups

- `/auth`
- `/users`
- `/categories`
- `/entities`
- `/entities/:id/reviews`
- `/reviews`
- `/votes`
- `/reports`
- `/claims`
- `/replies`
- `/admin/*`

## 8. Recommended MVP Timeline for a Side Project

### If part-time solo
- 10 to 16 weeks for private beta
- 16 to 24 weeks for public MVP with proper moderation and policy pages

### If full-time solo
- 6 to 10 weeks for private beta

## 9. Initial Hosting Plan

### Low-cost MVP
- Frontend: Vercel
- Backend: VPS or Render/Fly/Railway style deployment
- Database: managed Postgres
- Redis: managed small plan
- Object storage: Cloudflare R2 / S3-compatible

### Production-hardening later
- containerized deployment
- private networking
- worker separation
- backup verification
- CDN and caching strategy

## 10. Data Model Priorities

Prioritize the schema for:
1. users
2. phone verification
3. entities
4. reviews
5. moderation
6. claims
7. replies
8. trust scores
9. audit logs

Everything else can evolve later.

## 11. Engineering Rules for MVP

- keep domain names explicit
- avoid premature microservices
- use strict validation everywhere
- never store OTP in plaintext
- keep audit logs immutable
- soft-delete user content when possible
- design moderation actions first, not later
- write internal admin tools early

## 12. Launch Checklist

- policy pages are published
- review form warning language is live
- report flows work
- claim flow works
- moderation queue is staffed
- OTP abuse limits work
- duplicate detection works well enough
- backups tested
- logs visible
- error monitoring live

## 13. Practical Recommendation

For this product, build:
- **Next.js web**
- **NestJS API**
- **PostgreSQL + Prisma**
- **Redis**
- **manual moderation assisted by rules**

That is the best balance between speed, trust, and long-term quality.
