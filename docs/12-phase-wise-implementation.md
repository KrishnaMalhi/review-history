# ReviewHistory — Phase-Wise Implementation

A 9-phase development roadmap from monorepo setup to enterprise-scale features.

---

## Phase 1 — Foundation 🔴 NOT STARTED
**Timeline:** Week 1–2
**Goal:** Monorepo scaffold, database schema, authentication API

### Tasks
- [ ] Initialise Turborepo monorepo with `pnpm`
- [ ] Configure `pnpm-workspace.yaml` with apps/* and packages/*
- [ ] Create `turbo.json` with build, dev, lint pipelines
- [ ] Set up `packages/db` — Prisma schema with all 12 tables
- [ ] Write initial migration and seed script
- [ ] Set up `packages/types` — all shared TypeScript interfaces
- [ ] Set up `packages/utils` — trust score calculator, anti-fake checks
- [ ] Create `apps/api` — NestJS project
- [ ] Implement `AuthModule`:
  - [ ] POST /auth/send-otp (Twilio SMS)
  - [ ] POST /auth/verify-otp (OTP check + JWT)
  - [ ] PATCH /auth/profile
  - [ ] GET /auth/me
- [ ] JWT Guard + global validation pipe
- [ ] Rate limiting with `@nestjs/throttler`
- [ ] Configure Railway PostgreSQL connection
- [ ] Write unit tests for AuthService
- [ ] Set up `.env.example` with all required variables

### Deliverables
- Working monorepo that runs with `pnpm dev`
- Auth API with passing tests
- Database with all tables migrated

---

## Phase 2 — Core Backend 🔴 NOT STARTED
**Timeline:** Week 3–4
**Goal:** All entity and review endpoints, admin panel API, Swagger docs

### Tasks
- [ ] Implement `EntitiesModule`:
  - [ ] GET /entities (list + filter)
  - [ ] GET /entities/:id (detail + warning tags)
  - [ ] POST /entities (add new entity)
  - [ ] POST /entities/:id/claim
  - [ ] POST /entities/:id/flag-duplicate
  - [ ] Duplicate detection (PostgreSQL `similarity()`)
  - [ ] Slug generation function
  - [ ] Full-text search vector trigger
- [ ] Implement `ReviewsModule`:
  - [ ] GET /entities/:id/reviews
  - [ ] POST /entities/:id/reviews (with anti-fake checks)
  - [ ] DELETE /reviews/:id
  - [ ] POST /reviews/:id/vote
  - [ ] POST /reviews/:id/report
  - [ ] POST /reviews/:id/reply (owner only)
- [ ] Implement `SearchModule`:
  - [ ] GET /search (full-text PostgreSQL tsvector)
- [ ] Implement `UploadModule`:
  - [ ] POST /upload/image (Cloudinary)
- [ ] Implement `AdminModule`:
  - [ ] GET /admin/reports
  - [ ] PATCH /admin/reports/:id
  - [ ] PATCH /admin/reviews/:id/status
  - [ ] POST /admin/entities/merge
  - [ ] GET /admin/stats
  - [ ] PATCH /admin/users/:id/ban
- [ ] Implement `CategoriesModule`:
  - [ ] GET /categories
  - [ ] GET /warning-tags
- [ ] Auto-generate Swagger documentation
- [ ] Write integration tests for all endpoints
- [ ] IP hashing middleware

### Deliverables
- Complete REST API with all endpoints
- Swagger UI accessible at `/api/docs`
- All tests passing

---

## Phase 3 — Web Frontend 🔴 NOT STARTED
**Timeline:** Week 5–6
**Goal:** Next.js web app with all pages, SSR/SEO optimised

### Tasks
- [ ] Create `apps/web` — Next.js 14 App Router project
- [ ] Configure Tailwind CSS
- [ ] Set up API client (`lib/api-client.ts`)
- [ ] Build shared UI components:
  - [ ] StarRating
  - [ ] TrustScoreBadge
  - [ ] EntityCard
  - [ ] ReviewCard
  - [ ] WarningTagBadge
  - [ ] SearchBar
  - [ ] PhotoUpload
- [ ] Build pages:
  - [ ] `/` — Home page (search hero + category browse)
  - [ ] `/search` — Search results (SSR)
  - [ ] `/entities/[slug]` — Entity detail (ISR)
  - [ ] `/entities/add` — Add new entity form
  - [ ] `/reviews/add/[entityId]` — Multi-step review form
  - [ ] `/profile` — User profile (CSR)
  - [ ] `/login` — OTP login page
- [ ] SEO setup:
  - [ ] Dynamic `generateMetadata()` for entity pages
  - [ ] `sitemap.xml` generation
  - [ ] `robots.txt`
  - [ ] Structured data (JSON-LD) for entity pages
  - [ ] OpenGraph + Twitter Card tags
- [ ] WhatsApp share button with Urdu message generation
- [ ] Responsive design (mobile-first)

### Deliverables
- Full web app deployed to Vercel preview
- Entity pages ranking on Google within 4 weeks of launch

---

## Phase 4 — Trust & Safety 🔴 NOT STARTED
**Timeline:** Week 7
**Goal:** Community voting, reporting, admin dashboard

### Tasks
- [ ] Helpful/Fake voting UI on review cards
- [ ] Report review modal (reason + details)
- [ ] Admin dashboard page (`/admin`):
  - [ ] Stats overview cards
  - [ ] Pending reviews queue
  - [ ] Open reports queue
  - [ ] User management (ban/unban)
  - [ ] Entity merge tool
- [ ] Auto-hide trigger when fake vote ratio > 70%
- [ ] Email/SMS notifications for admin on new reports
- [ ] Moderator role with restricted admin access
- [ ] Content moderation guidelines page

### Deliverables
- Fully functional admin dashboard
- Community voting working end-to-end
- Notification system active

---

## Phase 5 — Mobile App 🔴 NOT STARTED
**Timeline:** Week 8
**Goal:** React Native + Expo app for iOS and Android

### Tasks
- [ ] Create `apps/mobile` — Expo with `expo-router`
- [ ] Configure `expo-secure-store` for JWT storage
- [ ] Share API client from `packages/utils`
- [ ] Build screens:
  - [ ] `(tabs)/index` — Home + search
  - [ ] `(tabs)/search` — Search + filter
  - [ ] `(tabs)/profile` — User profile
  - [ ] `(tabs)/notifications` — Review alerts
  - [ ] `entities/[id]` — Entity detail
  - [ ] `entities/add` — Add entity
  - [ ] `reviews/add/[entityId]` — Add review (multi-step)
  - [ ] `login` — OTP login
- [ ] WhatsApp deep link share
- [ ] Push notifications with Expo Notifications
- [ ] Offline cache for recently viewed entities
- [ ] Submit to Google Play Store (beta)
- [ ] Submit to Apple TestFlight

### Deliverables
- Working app on iOS and Android
- Published to TestFlight and Play Store internal testing

---

## Phase 6 — Launch Prep 🔴 NOT STARTED
**Timeline:** Week 9
**Goal:** Production deployment, monitoring, beta testing

### Tasks
- [ ] Production deployment:
  - [ ] API to Railway production environment
  - [ ] Web to Vercel production
  - [ ] Database backup strategy (daily automated)
  - [ ] SSL certificates for reviewhistory.pk
- [ ] Monitoring setup:
  - [ ] Sentry error tracking (web + API + mobile)
  - [ ] Railway metrics dashboard
  - [ ] Uptime monitoring (UptimeRobot or Better Uptime)
- [ ] Beta testing:
  - [ ] 20 beta users in Lahore
  - [ ] Collect 50+ real reviews
  - [ ] Fix all critical bugs
- [ ] Legal:
  - [ ] Terms & Conditions page live
  - [ ] Privacy Policy page live
  - [ ] Contact / report abuse page live

### Deliverables
- Live production deployment at reviewhistory.pk
- First 50 reviews live
- All monitoring active

---

## Phase 7 — Growth 🔴 NOT STARTED
**Timeline:** Month 3+
**Goal:** User acquisition, viral growth, Urdu UI

### Tasks
- [ ] Urdu language support throughout the platform
- [ ] Facebook group campaign (target 50 relevant groups)
- [ ] TikTok content series: "Landlord Exposed" / "Doctor Review"
- [ ] WhatsApp broadcast lists setup
- [ ] Student Ambassador Program launch (PKR 300/user referral)
- [ ] Google SEO monitoring (Search Console)
- [ ] Target: 1,000 users by end of Month 3
- [ ] Target: 5,000 users by end of Month 4
- [ ] City expansion: Karachi → Islamabad → Faisalabad

### Deliverables
- 5,000 registered users
- 15+ cities with active listings
- Urdu UI available as language option

---

## Phase 8 — Monetization 🔴 NOT STARTED
**Timeline:** Month 6+
**Goal:** First revenue, payment systems, business tools

### Tasks
- [ ] JazzCash payment integration
- [ ] EasyPaisa payment integration
- [ ] Verified Business Badge system
- [ ] Featured Listing product
- [ ] Reputation Dashboard (analytics for businesses)
- [ ] Premium User Plan (notifications, PDF export)
- [ ] Business claim approval workflow polish
- [ ] Invoice generation for business payments
- [ ] Revenue tracking dashboard (internal)

### Deliverables
- First PKR 85,000/month revenue milestone
- 30+ paying business accounts
- Break-even achieved

---

## Phase 9 — Scale 🔴 NOT STARTED
**Timeline:** Year 2+
**Goal:** Platform scale, B2B API, AI features, national reach

### Tasks
- [ ] Voice reviews (record audio, auto-transcribe to text)
- [ ] WhatsApp Bot (@ReviewHistoryBot on WhatsApp)
- [ ] B2B API for property portals (Zameen.com integration pitch)
- [ ] Machine learning: auto-detect fake reviews
- [ ] Sentiment analysis for warning tag suggestions
- [ ] National news / media PR campaign
- [ ] Series A fundraising preparation
- [ ] International expansion research (Bangladesh, Sri Lanka)
- [ ] Android widget for quick entity check
- [ ] iOS Share Extension for in-app review submission

### Deliverables
- 100,000 users
- B2B API first partner signed
- Series A investment secured
# 12 — Phase-wise Implementation

## Phase 1 — Foundation
- [ ] finalize product scope
- [ ] confirm categories for MVP
- [ ] choose brand/domain
- [ ] set up monorepo or dual repo structure
- [ ] configure CI/CD basics
- [ ] environments, secrets, base infra

## Phase 2 — Auth and Core Accounts
- [ ] phone OTP flow
- [ ] JWT session system
- [ ] user profile basics
- [ ] user devices and sessions
- [ ] rate limit foundation

## Phase 3 — Categories, Locations, Entities
- [ ] city/locality datasets
- [ ] categories table
- [ ] warning tags table
- [ ] entity creation flow
- [ ] entity search
- [ ] duplicate suggestion on create

## Phase 4 — Reviews and Replies
- [ ] create review endpoint
- [ ] one-review-per-entity rule
- [ ] review list page
- [ ] helpful/fake voting
- [ ] owner replies
- [ ] profile detail pages

## Phase 5 — Trust Score and Risk Engine
- [ ] trust score formula v1
- [ ] review weighting
- [ ] suspicious activity flags
- [ ] under verification state
- [ ] duplicate detection jobs
- [ ] moderation triggers

## Phase 6 — Moderation and Claims
- [ ] review reports
- [ ] moderation queue
- [ ] moderation actions
- [ ] audit logs
- [ ] entity claim flow
- [ ] claim approval admin process

## Phase 7 — Legal, Privacy, and SEO
- [ ] privacy policy page
- [ ] terms page
- [ ] content policy page
- [ ] complaint route
- [ ] SEO entity pages
- [ ] structured metadata basics

## Phase 8 — Monetization
- [ ] plans and billing
- [ ] claim upgrade path
- [ ] profile analytics
- [ ] sponsored listing logic
- [ ] ad disclosure UI

## Phase 9 — Growth and Optimization
- [ ] share flows
- [ ] WhatsApp optimized cards
- [ ] city/category landing pages
- [ ] trust alerts / saved entities
- [ ] analytics dashboard
- [ ] experimentation and conversion tuning
