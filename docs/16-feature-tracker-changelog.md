# ReviewHistory — Feature Tracker & Changelog

---

## 📊 Implementation Status Overview

| Phase | Status | Progress |
|-------|--------|---------|
| Phase 1 — Foundation | 🔴 NOT STARTED | 0% |
| Phase 2 — Core Backend | 🔴 NOT STARTED | 0% |
| Phase 3 — Web Frontend | 🔴 NOT STARTED | 0% |
| Phase 4 — Trust & Safety | 🔴 NOT STARTED | 0% |
| Phase 5 — Mobile App | 🔴 NOT STARTED | 0% |
| Phase 6 — Launch Prep | 🔴 NOT STARTED | 0% |
| Phase 7 — Growth | 🔴 NOT STARTED | 0% |
| Phase 8 — Monetization | 🔴 NOT STARTED | 0% |
| Phase 9 — Scale | 🔴 NOT STARTED | 0% |

---

## ✅ Implemented

*Nothing implemented yet. This is the initial documentation state.*

---

## 🚧 In Progress

*Nothing in progress yet. Development begins with Phase 1.*

---

## 📋 Full Task Checklist

### Phase 1 — Foundation

- [ ] Initialise Turborepo monorepo with `pnpm`
- [ ] Configure `pnpm-workspace.yaml`
- [ ] Create `turbo.json` with build/dev/lint pipelines
- [ ] `packages/db`: Write Prisma schema (all 12 tables)
- [ ] `packages/db`: Run first migration
- [ ] `packages/db`: Write seed script
- [ ] `packages/types`: All TypeScript interfaces
- [ ] `packages/utils`: Trust score calculator
- [ ] `packages/utils`: Anti-fake check functions
- [ ] `packages/utils`: Formatters and helpers
- [ ] `apps/api`: NestJS project bootstrap
- [ ] Configure Prisma module in NestJS
- [ ] Configure ThrottlerModule (rate limiting)
- [ ] Configure global ValidationPipe
- [ ] `AuthModule`: POST /auth/send-otp
- [ ] `AuthModule`: POST /auth/verify-otp
- [ ] `AuthModule`: PATCH /auth/profile
- [ ] `AuthModule`: GET /auth/me
- [ ] JWT Guard implementation
- [ ] Roles Guard implementation
- [ ] Unit tests for AuthService
- [ ] `.env.example` with all required variables
- [ ] Railway PostgreSQL connection setup

### Phase 2 — Core Backend

- [ ] `EntitiesModule`: POST /entities (add entity)
- [ ] `EntitiesModule`: GET /entities (list + filter)
- [ ] `EntitiesModule`: GET /entities/:id (detail)
- [ ] `EntitiesModule`: POST /entities/:id/claim
- [ ] `EntitiesModule`: POST /entities/:id/flag-duplicate
- [ ] Duplicate detection using PostgreSQL `similarity()`
- [ ] Slug generation function
- [ ] Full-text search vector PostgreSQL trigger
- [ ] `ReviewsModule`: POST /entities/:id/reviews
- [ ] Anti-fake check integration in review submission
- [ ] `ReviewsModule`: GET /entities/:id/reviews
- [ ] `ReviewsModule`: DELETE /reviews/:id
- [ ] `ReviewsModule`: POST /reviews/:id/vote
- [ ] `ReviewsModule`: POST /reviews/:id/report
- [ ] `ReviewsModule`: POST /reviews/:id/reply
- [ ] Trust score recalculation on review events
- [ ] `SearchModule`: GET /search (PostgreSQL tsvector)
- [ ] `UploadModule`: POST /upload/image (Cloudinary)
- [ ] `AdminModule`: GET /admin/reports
- [ ] `AdminModule`: PATCH /admin/reports/:id
- [ ] `AdminModule`: PATCH /admin/reviews/:id/status
- [ ] `AdminModule`: POST /admin/entities/merge
- [ ] `AdminModule`: GET /admin/stats
- [ ] `AdminModule`: PATCH /admin/users/:id/ban
- [ ] `CategoriesModule`: GET /categories
- [ ] `CategoriesModule`: GET /warning-tags
- [ ] Swagger documentation auto-generation
- [ ] IP hashing middleware
- [ ] Integration tests for all endpoints

### Phase 3 — Web Frontend

- [ ] `apps/web`: Next.js 14 App Router initialisation
- [ ] Tailwind CSS setup
- [ ] API client (`lib/api-client.ts`)
- [ ] Component: StarRating
- [ ] Component: TrustScoreBadge
- [ ] Component: EntityCard
- [ ] Component: ReviewCard
- [ ] Component: WarningTagBadge
- [ ] Component: SearchBar with debounce
- [ ] Component: PhotoUpload (Cloudinary)
- [ ] Page: `/login` (phone + OTP flow)
- [ ] Page: `/` (home — search hero + categories)
- [ ] Page: `/search` (SSR search results + filters)
- [ ] Page: `/entities/[slug]` (ISR entity detail)
- [ ] Page: `/entities/add` (add new entity form)
- [ ] Page: `/reviews/add/[entityId]` (multi-step review form)
- [ ] Page: `/profile` (user profile + reviews)
- [ ] JWT cookie handling
- [ ] Protected route middleware
- [ ] Auth context / provider
- [ ] WhatsApp share button with Urdu message
- [ ] Dynamic `generateMetadata()` for entity pages
- [ ] `sitemap.xml` generation
- [ ] `robots.txt`
- [ ] JSON-LD structured data
- [ ] OpenGraph + Twitter Card meta tags
- [ ] Mobile-first responsive design

### Phase 4 — Trust & Safety

- [ ] Helpful / Fake vote buttons on review cards
- [ ] Report review modal
- [ ] Admin dashboard page (`/admin`)
- [ ] Admin: Stats overview cards
- [ ] Admin: Pending reviews queue
- [ ] Admin: Open reports queue with resolve/dismiss actions
- [ ] Admin: User management (ban/unban)
- [ ] Admin: Entity merge tool
- [ ] Auto-hide trigger at 70% fake vote ratio
- [ ] Admin notification on new reports
- [ ] Moderator role with restricted access
- [ ] Content moderation guidelines page

### Phase 5 — Mobile App

- [ ] `apps/mobile`: Expo with `expo-router` initialisation
- [ ] `expo-secure-store` JWT storage
- [ ] Screen: `(tabs)/index` (home + search)
- [ ] Screen: `(tabs)/search`
- [ ] Screen: `(tabs)/profile`
- [ ] Screen: `(tabs)/notifications`
- [ ] Screen: `entities/[id]`
- [ ] Screen: `entities/add`
- [ ] Screen: `reviews/add/[entityId]`
- [ ] Screen: `login`
- [ ] WhatsApp deep link share
- [ ] Push notifications (Expo Notifications)
- [ ] Offline cache for recent entities
- [ ] Google Play Store beta submission
- [ ] Apple TestFlight submission

### Phase 6 — Launch Prep

- [ ] API production deployment to Railway
- [ ] Web production deployment to Vercel
- [ ] Database daily backup strategy
- [ ] SSL for reviewhistory.pk
- [ ] Sentry error tracking (web + API + mobile)
- [ ] UptimeRobot monitoring
- [ ] 20 beta users recruited
- [ ] 50+ real reviews collected
- [ ] All critical beta bugs fixed
- [ ] Terms & Conditions page live
- [ ] Privacy Policy page live
- [ ] Report/abuse contact page live
- [ ] Soft launch announcement

### Phase 7 — Growth

- [ ] Urdu language support throughout platform
- [ ] Facebook group campaign (50 groups)
- [ ] TikTok content series (5 videos)
- [ ] WhatsApp broadcast list setup
- [ ] Student Ambassador Program launch
- [ ] Google Search Console monitoring
- [ ] City expansion to Karachi
- [ ] City expansion to Islamabad
- [ ] City expansion to Faisalabad
- [ ] 1,000 users milestone
- [ ] 5,000 users milestone

### Phase 8 — Monetization

- [ ] JazzCash payment integration
- [ ] EasyPaisa payment integration
- [ ] Stripe payment integration (international cards)
- [ ] Verified Business Badge product
- [ ] Featured Listing product
- [ ] Reputation Dashboard analytics
- [ ] Premium User Plan (PKR 299/month)
- [ ] Business claim approval workflow polish
- [ ] Invoice generation
- [ ] Revenue tracking dashboard (internal)
- [ ] 44 paying businesses milestone (break-even)

### Phase 9 — Scale

- [ ] Voice reviews (audio upload + auto-transcription)
- [ ] WhatsApp Bot (@ReviewHistoryBot)
- [ ] B2B API for property portals
- [ ] Machine learning fake review detection
- [ ] Sentiment analysis for warning tag suggestions
- [ ] National PR / media campaign
- [ ] Series A fundraising preparation
- [ ] International expansion research
- [ ] Android widget
- [ ] iOS Share Extension
- [ ] 100,000 users milestone

---

## 💡 Future Ideas

### High Priority

- [ ] Urdu voice input for reviews (removes literacy barrier)
- [ ] Anonymous tip submission (no account required, lower-trust weight)
- [ ] Verified review badge for reviewers who upload proof (receipt/photo)
- [ ] Entity comparison tool (side-by-side two doctors)
- [ ] "Near Me" search using device GPS
- [ ] Review request link (businesses can send customers a link to review them)

### Medium Priority

- [ ] Bulk import of entities from CSV (for beta launch seeding)
- [ ] Browser extension: show ReviewHistory score on Google Maps, OLX, Zameen.com
- [ ] Dark mode
- [ ] Review translations (Urdu ↔ English auto-translate)
- [ ] Shareable review link (individual review, not just entity page)
- [ ] "Watchlist" for tenant — get notified when a saved entity gets a new review
- [ ] Neighbourhood-level safety scores aggregated from entity reviews

### Low Priority

- [ ] Gamification: reviewer badges (Trusted Reviewer, Community Champion)
- [ ] Monthly "Worst Landlord in Lahore" public report (community engagement)
- [ ] Integration with NADRA data for enhanced identity verification (Year 3+)
- [ ] API for journalists and researchers (free tier with attribution)
- [ ] Print-friendly entity report (for court / legal proceedings)

---

## 🐛 Known Bugs

*None yet. Development has not started.*

---

## 📋 Decision Log

| Date | Decision | Reason | Alternatives Considered |
|------|----------|--------|------------------------|
| 2026-04-03 | Use NestJS for backend | TypeScript-first, modular, Swagger built-in | Express.js (too minimal), Fastify (less ecosystem) |
| 2026-04-03 | Use Next.js 14 App Router for web | ISR/SSR critical for SEO; Vercel deployment | Remix (smaller ecosystem), SvelteKit (team unfamiliarity) |
| 2026-04-03 | Use Turborepo + pnpm monorepo | Share types/utils/db across apps | Separate repos (harder to keep in sync), Nx (more complex) |
| 2026-04-03 | Use PostgreSQL over MongoDB | Full-text search, ACID, tsvector for search | MongoDB (no tsvector), MySQL (weaker full-text search) |
| 2026-04-03 | Use Prisma ORM | Type safety, SQL injection prevention, migrations | TypeORM (more verbose), Drizzle (newer, less ecosystem) |
| 2026-04-03 | Phone OTP only (no email auth) | Pakistan SIM = NADRA-verified identity; reduces fake accounts | Email auth (no identity verification), Social login (privacy concerns) |
| 2026-04-03 | Entity without account model | Bad actors won't self-register; communities must be able to add them | Require entity registration (kills core use case) |
| 2026-04-03 | 1 review per user per entity | Prevents repeated review bombing | Multiple reviews (gameable by bad actors) |
| 2026-04-03 | IP stored as HMAC-SHA256 hash | Privacy compliance; anti-fake signals without PII storage | Raw IP storage (privacy violation), No IP tracking (loses anti-fake signal) |
| 2026-04-03 | Owner reply but not delete | Prevents censorship of genuine negative reviews | Owner delete (kills platform credibility) |
| 2026-04-03 | Free until 10,000 users | Community trust must be established before monetisation | Early monetisation (kills growth, kills trust) |
| 2026-04-03 | WhatsApp share as primary growth engine | 80M+ Pakistani WhatsApp users; viral sharing built into culture | Facebook Ads (expensive), Google Ads (costly for startup) |
| 2026-04-03 | Hyper-local launch (Johar Town, Lahore) | Concentrated reviews create visible value faster | National launch (dilutes density, less value per city) |
| 2026-04-03 | PKR pricing for all products | Pakistani market; USD pricing creates psychological barrier | USD pricing (alienates local businesses) |

---

## 📝 Changelog

### v0.1.0 — 2026-04-03 (Documentation Release)

**Added:**
- `docs/README.md` — Documentation index
- `docs/01-product-overview.md` — Vision, problem, solution, competitors
- `docs/02-business-model.md` — Revenue streams and projections
- `docs/03-technical-architecture.md` — Tech stack and system design
- `docs/04-database-schema.md` — All 12 database tables
- `docs/05-api-documentation.md` — All API endpoints
- `docs/06-user-flows.md` — 8 user journey flows
- `docs/07-categories-and-warning-tags.md` — 10 categories + warning tags
- `docs/08-trust-score-system.md` — Trust score algorithm
- `docs/09-anti-fake-review-system.md` — 4-layer anti-fake defense
- `docs/10-legal-privacy-policy.md` — Legal strategy and privacy policy
- `docs/11-security-docs.md` — Security architecture and threat model
- `docs/12-phase-wise-implementation.md` — 9-phase roadmap
- `docs/13-mvp-build-plan.md` — 8-week build plan
- `docs/14-monetization-strategy.md` — 5 revenue streams
- `docs/15-marketing-strategy.md` — Go-to-market strategy
- `docs/16-feature-tracker-changelog.md` — This file

**Status:** Documentation only. No code written yet. Development starts Week 1.
