# ReviewHistory — MVP Build Plan

An 8-week plan to build and launch the ReviewHistory Minimum Viable Product as a solo developer.

---

## 🎯 MVP Definition

### What's IN the MVP

| Feature | Why It's Core |
|---------|---------------|
| Phone OTP auth | Identity verification is the foundation |
| Add any entity | Core differentiator — no registration required |
| Submit review | Core value proposition |
| View entity + reviews | The hook for new visitors |
| Trust Score display | Instant danger/safe signal |
| Warning tags | At-a-glance complaint summary |
| WhatsApp share | Primary growth engine |
| Search (text + category + city) | Discovery mechanism |
| Basic admin panel | Moderation essential from day 1 |
| SEO-optimised entity pages | Organic traffic from Google |

### What's OUT of the MVP

| Feature | When |
|---------|------|
| Mobile app (React Native) | Phase 5 (Week 8–9) |
| Paid features / monetization | Phase 8 (Month 6+) |
| Reputation Dashboard | Phase 8 |
| Voice reviews | Phase 9 (Year 2) |
| WhatsApp Bot | Phase 9 |
| B2B API | Phase 9 |
| Urdu UI | Phase 7 (Month 3) |
| Push notifications | Phase 5 |

---

## 📅 8-Week Daily Schedule

### Week 1: Monorepo + Auth API

| Day | Tasks |
|-----|-------|
| Mon | Init Turborepo + pnpm. Create folder structure. Configure `turbo.json` |
| Tue | `packages/db`: Write full Prisma schema. Run first migration |
| Wed | `packages/types`: All TypeScript interfaces. `packages/utils`: trust-score stub |
| Thu | `apps/api`: NestJS bootstrap. Configure Prisma module, ThrottlerModule, ValidationPipe |
| Fri | `AuthModule`: send-otp + verify-otp endpoints. Twilio integration |
| Sat | `AuthModule`: JWT Guard, GET /auth/me, PATCH /auth/profile |
| Sun | Write unit tests for AuthService. Fix bugs. Push to GitHub |

**Week 1 Deliverable:** `pnpm dev` starts API server. Can send OTP, verify, receive JWT. ✓

---

### Week 2: Entity + Review API

| Day | Tasks |
|-----|-------|
| Mon | `EntitiesModule`: POST /entities, GET /entities/:id |
| Tue | `EntitiesModule`: GET /entities (list/filter), duplicate detection |
| Wed | `EntitiesModule`: slug generation, full-text search vector trigger |
| Thu | `ReviewsModule`: POST /entities/:id/reviews (with anti-fake checks) |
| Fri | `ReviewsModule`: GET reviews, DELETE review, POST vote |
| Sat | `ReviewsModule`: POST report, POST reply. `SearchModule`: GET /search |
| Sun | `UploadModule`: Cloudinary. `CategoriesModule`: GET /categories, /warning-tags. Swagger |

**Week 2 Deliverable:** All API endpoints working. Swagger docs accessible at /api/docs. ✓

---

### Week 3: Next.js Setup + Auth UI

| Day | Tasks |
|-----|-------|
| Mon | `apps/web`: Next.js 14 App Router init. Tailwind CSS. API client setup |
| Tue | Shared UI components: TrustScoreBadge, StarRating, EntityCard |
| Wed | Shared UI components: ReviewCard, WarningTagBadge, SearchBar |
| Thu | `/login` page: Phone input + OTP step |
| Fri | JWT cookie handling, protected route middleware, auth context |
| Sat | `/profile` page: View own reviews, edit profile |
| Sun | Responsive CSS polish. Mobile-first breakpoints. Test on phone |

**Week 3 Deliverable:** Login works end-to-end. Profile page visible. ✓

---

### Week 4: Home + Search Pages

| Day | Tasks |
|-----|-------|
| Mon | `/` Home page: Search hero section, category browse grid |
| Tue | Home page: Top-rated entities per category, recent reviews feed |
| Wed | `/search` page: SSR search results, filter sidebar (category, city) |
| Thu | Search results pagination, empty state, "Add Entity" CTA |
| Fri | Search bar autocomplete with 300ms debounce |
| Sat | Responsive testing, performance check, fix hydration issues |
| Sun | SEO: robots.txt, sitemap.xml generation |

**Week 4 Deliverable:** Home page live. Search returns real results from DB. ✓

---

### Week 5: Entity Detail + WhatsApp Share

| Day | Tasks |
|-----|-------|
| Mon | `/entities/[slug]` page: Entity header (name, city, trust score, rating) |
| Tue | Entity page: Warning tags grid, rating breakdown bar chart |
| Wed | Entity page: Reviews list with pagination |
| Thu | Entity page: Owner reply display. Helpful/Fake vote buttons (requires login) |
| Fri | Entity page: ISR setup (revalidate every 60 seconds) |
| Sat | WhatsApp share button: Generate Urdu message, open WhatsApp deep link |
| Sun | SEO: Dynamic generateMetadata(), JSON-LD structured data, OpenGraph |

**Week 5 Deliverable:** Entity pages fully working with WhatsApp share. SEO metadata live. ✓

---

### Week 6: Add Entity + Add Review Forms

| Day | Tasks |
|-----|-------|
| Mon | `/entities/add` form: Name, category, city, area, address fields |
| Tue | Duplicate check UI: Show potential matches before submitting |
| Wed | Add entity: Confirm and submit. Show new entity page on success |
| Thu | `/reviews/add/[entityId]`: Step 1 (overall rating) + Step 2 (dimension ratings) |
| Fri | Review form: Step 3 (warning tags) + Step 4 (text body) |
| Sat | Review form: Step 5 (photo upload via Cloudinary) + Step 6 (submit) |
| Sun | Review form: Success animation. Error handling. Mobile UX polish |

**Week 6 Deliverable:** Full review submission flow working end-to-end. ✓

---

### Week 7: SEO + Deploy

| Day | Tasks |
|-----|-------|
| Mon | Admin panel (`/admin`): Stats overview, pending reviews queue |
| Tue | Admin panel: Open reports queue, resolve/dismiss actions |
| Wed | Admin panel: User management (ban), entity merge tool |
| Thu | Performance audit: Lighthouse scores, image optimisation |
| Fri | Production environment setup: Railway (API + DB), Vercel (Web) |
| Sat | DNS setup for reviewhistory.pk. SSL certificates. ENV vars in production |
| Sun | End-to-end smoke test in production. Fix production bugs |

**Week 7 Deliverable:** Live at reviewhistory.pk. All core flows tested in production. ✓

---

### Week 8: Beta + Soft Launch

| Day | Tasks |
|-----|-------|
| Mon | Invite 20 beta users (friends, family, local community) |
| Tue | Collect first 20 real reviews on real local entities |
| Wed | Monitor logs, fix bugs reported by beta users |
| Thu | Add Sentry error tracking. Set up UptimeRobot monitoring |
| Fri | WhatsApp seeding: Share entity pages in 5–10 WhatsApp groups |
| Sat | Facebook group post in 5 groups (tenant rights, local community) |
| Sun | Soft launch: Post on LinkedIn, Twitter, Facebook — "ReviewHistory is live!" |

**Week 8 Deliverable:** 50+ real reviews. 100+ users. Platform stable. ✓

---

## ✅ MVP Success Criteria

The MVP is considered successful when ALL of the following are met:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Registered users | 100+ | Admin stats dashboard |
| Published reviews | 50+ | Admin stats dashboard |
| Unique entities listed | 30+ | Admin stats dashboard |
| WhatsApp shares | 20+ | Track share button click events |
| Zero critical security issues | 0 | No auth bypasses, no data leaks |

---

## 🧰 Solo Developer Setup

**Recommended tools for solo development:**

| Tool | Purpose |
|------|---------|
| VS Code + Prisma extension | Database schema editing |
| VS Code + REST Client | API testing without Postman |
| TablePlus | Visual database browser |
| Vercel preview deployments | Auto-preview on every PR |
| Railway logs | Production API log monitoring |
| Sentry | Error tracking (free tier) |
| GitHub Actions | CI: lint + test on every push |

**Daily workflow:**

```bash
# Start all services
pnpm dev

# Run tests before committing
pnpm test

# Push changes
git add . && git commit -m "feat: ..." && git push

# Check deployment
# Vercel auto-deploys web on push to main
# Railway auto-deploys API on push to main
```
# 13 — MVP Build Plan

## Goal

Ship a strong side-project MVP in 8 weeks using a lean stack and solo-founder-friendly scope.

## Recommended Stack for a Side Project

- Next.js frontend
- NestJS backend
- PostgreSQL
- Prisma
- Redis
- Tailwind
- Vercel or self-hosted frontend
- VPS or managed backend container
- basic object storage
- local analytics + error tracking

## Week 1 — Setup and Design
Day 1: repo setup, environments, CI
Day 2: database base schema, migrations
Day 3: auth module skeleton
Day 4: frontend shell, routing, layout
Day 5: category/location seed data
Day 6: design system basics
Day 7: polish and review

## Week 2 — OTP Auth
Day 8: request OTP endpoint
Day 9: verify OTP endpoint
Day 10: session/refresh token flow
Day 11: auth UI
Day 12: rate limits and cooldowns
Day 13: device/session capture
Day 14: testing

## Week 3 — Entities
Day 15: categories and tags APIs
Day 16: entity schema
Day 17: create entity endpoint
Day 18: entity search endpoint
Day 19: detail page
Day 20: duplicate candidate logic v0
Day 21: testing

## Week 4 — Reviews
Day 22: review schema and endpoint
Day 23: one-review-per-entity enforcement
Day 24: review list UI
Day 25: review composer UI
Day 26: tag chips and filters
Day 27: helpful/fake voting
Day 28: testing

## Week 5 — Trust and Risk
Day 29: trust score service
Day 30: entity aggregates
Day 31: suspicious review rules v1
Day 32: under-verification state
Day 33: moderation case creation
Day 34: trust score UI
Day 35: testing

## Week 6 — Claims and Replies
Day 36: entity claim request
Day 37: claimant verification steps
Day 38: owner replies endpoint
Day 39: owner dashboard basics
Day 40: admin approval screens
Day 41: audit logs
Day 42: testing

## Week 7 — Legal and Production Readiness
Day 43: privacy / terms / policy pages
Day 44: report review flow
Day 45: complaint process backend
Day 46: analytics events
Day 47: SEO basics
Day 48: monitoring and alerting
Day 49: staging QA

## Week 8 — Launch Prep
Day 50: city/category seed content
Day 51: onboarding flows
Day 52: WhatsApp sharing
Day 53: landing page and positioning
Day 54: bug fixes
Day 55: smoke testing
Day 56: soft launch

## MVP Deliverables
- OTP auth
- entity creation
- search
- reviews
- tags
- trust score
- duplicate suggestions
- claims
- replies
- moderation queue
- legal pages
- basic analytics
