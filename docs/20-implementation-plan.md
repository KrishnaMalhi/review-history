# ReviewHistory — Full Platform Expansion Implementation Plan

## 1. CODEBASE UNDERSTANDING

### Current State (24 tables, 16 modules)
**Backend**: NestJS + Prisma + PostgreSQL + Redis. 16 modules: auth, users, categories, entities, reviews, votes, reports, replies, entity-claims, moderation, trust, search, notifications, audit, admin, health. Global JWT auth, RBAC guard, rate limiting, response interceptor, sanitization utils.

**Frontend (Web)**: Next.js 14 App Router + Tailwind. Pages: home, feed, search, entities (detail + add), auth (login/register/verify), dashboard (reviews/claims/saved/profile/notifications), categories, about, policies. Components: UI kit (button, card, input, modal, star-rating, badge, skeleton), shared (header, footer, protected-route, trust-score, category-icon, toast). React Query hooks for all API calls.

**Schema**: User, UserDevice, Session, Category, WarningTag, Country/State/City/Locality, Entity, EntityAlias, EntityClaim, Review, ReviewTagLink, ReviewVote, ReviewReport, ReviewReply, ModerationCase, ModerationAction, DuplicateCandidate, DuplicateMergeVote, TrustScoreEvent, AuditLog, Notification, BillingCustomer, BillingInvoice.

---

## 2. 15-FEATURE GAP ANALYSIS

| # | Feature | Current State | Gap |
|---|---------|--------------|-----|
| 1 | Review Request Link | ❌ Not started | Full build: ReviewInvite model, token gen, resolve endpoint, tracking |
| 2 | Verified Profile + Response Score | ❌ Not started | EmployerProfile, EntityResponseMetric, CategoryExtension profiles |
| 3 | Contributor Reputation | ❌ Not started | Badge model, user milestones, trust-tier visual, profile progress |
| 4 | Behavior Notifications | ⚠️ Partial (basic types exist) | Add: helpful milestones, reply alerts, weekly recap triggers |
| 5 | Follow System | ❌ Not started | Follow model, follow/unfollow API, feed personalization |
| 6 | Micro-Communities | ❌ Not started | Tag pages, category+city trending, community feeds |
| 7 | Streaks & Challenges | ❌ Not started | ReviewStreak, Challenge models, streak tracking, rewards |
| 8 | Rich Sharing | ⚠️ Partial (basic share buttons) | OpenGraph meta, WhatsApp cards, share snippets |
| 9 | Trust-first Feed | ⚠️ Partial (chronological) | Composite feed scoring, trust-weighted blocks |
| 10 | Onboarding Funnel | ❌ Not started | Interest picker, city selection, tailored first feed |
| 11 | AI Response Assist | ❌ Not started | Response templates, AI suggestion endpoint |
| 12 | Community Validation | ⚠️ Partial (helpful/fake votes) | Add: confirmed, outdated, resolved actions |
| 13 | Localization (EN/UR) | ⚠️ Partial (DB bilingual, UI English only) | UI i18n, bilingual prompts, Urdu-first mode |
| 14 | Quality Scoring | ❌ Not started | Review quality score formula, visibility boost |
| 15 | Campaign System | ❌ Not started | Campaign model, leaderboards, achievements |

---

## 3. LAYER-WISE GAP ANALYSIS

### Layer A — General Platform (landlords, shops, mechanics, etc.)
- ✅ Base review system works for all categories
- ❌ Missing: Follow, badges, streaks, quality scoring, community validation
- ❌ Missing: Rich sharing, onboarding, localization

### Layer B — Employee / Employer (Deep)
- ❌ EmployerProfile model (industry, size, benefits, verification)
- ❌ WorkplaceReviewData (culture, salary, management, growth, WLB sub-ratings)
- ❌ SalarySubmission (anonymous aggregated)
- ❌ Employer dashboard (analytics, response prompts)
- ❌ Review request links (invite system)
- ❌ Response metrics (response rate, avg time, issues resolved)
- ❌ Anti-retaliation + PII protection (partial — anonymous exists but not enforced for workplace)

### Layer C — Schools (Deep)
- ❌ SchoolProfile (type, curriculum, fee range, facilities, branches)
- ❌ SchoolReviewData (teaching, discipline, environment, admin, extracurriculars, safety)
- ❌ Multi-branch review support
- ❌ Parent/student/alumni reviewer type
- ❌ Admission experience reviews

### Layer D — Doctors & Hospitals
- ❌ MedicalProfile (specialization, qualifications, experience, affiliation, fee, timings)
- ❌ MedicalReviewData (treatment, diagnosis, behavior, wait time, staff, cleanliness, cost)
- ❌ Strict moderation rules for medical content
- ❌ No misinformation/defamation filters

### Layer E — Food Products
- ❌ ProductProfile (brand, variants, nutrition)
- ❌ ProductReviewData (taste, quality, value, packaging, consistency)
- ❌ Image reviews
- ❌ Quick rating UX
- ❌ Trending products

---

## 4. ARCHITECTURE DESIGN

### Core Principle: BASE + EXTENSION PATTERN

```
┌─────────────────────────────────────────┐
│          BASE SYSTEM (unchanged)        │
│  Entity, Review, User, Claim, Reply,    │
│  Notification, Feed, Trust, Moderation  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────────────────────┐
    │          │                          │
    ▼          ▼          ▼          ▼    ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Employer│ │ School │ │Medical │ │Product │
│Profile │ │Profile │ │Profile │ │Profile │
│+Review │ │+Review │ │+Review │ │+Review │
│Data    │ │Data    │ │Data    │ │Data    │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Extension Pattern
1. Each category vertical gets a **Profile** model (1:1 optional child of Entity)
2. Each category vertical gets a **ReviewData** model (1:1 optional child of Review)
3. Base Entity/Review remain unchanged — no new required fields
4. Category-aware logic lives in a `CategoryExtensionService` that routes by category key
5. Frontend renders extension data only when present (graceful degradation)

---

## 5. PHASE PLAN

### Phase 1 — Foundation + Employer Vertical (Sprint 1-4)
- DB migration: all new enums + models
- EmployerProfile, ResponseMetric, Badge, ReviewInvite, Follow, WorkplaceReviewData
- Backend modules: employer-profiles, response-metrics, badges, review-invites, follows
- Frontend: entity profile enhancements, follow button, employer dashboard (basic)

### Phase 2 — Engagement + Schools + Medical (Sprint 5-8)
- SchoolProfile, SchoolReviewData, MedicalProfile, MedicalReviewData
- Contributor reputation, streaks, quality scoring
- Behavior notifications extensions
- Community validation actions
- Feed ranking enhancement

### Phase 3 — Products + Growth + Polish (Sprint 9-12)
- ProductProfile, ProductReviewData
- Campaign system, onboarding funnel
- AI response assist, response templates
- Rich sharing, micro-communities
- Full localization (EN/UR)

---

## 6. API PLAN (Phase 1)

### New Endpoints

| Module | Method | Route | Auth |
|--------|--------|-------|------|
| EmployerProfile | GET | `/entities/:id/employer-profile` | Public |
| EmployerProfile | POST | `/entities/:id/employer-profile` | Owner |
| EmployerProfile | PATCH | `/entities/:id/employer-profile` | Owner |
| ResponseMetric | GET | `/entities/:id/response-metrics` | Public |
| Badge | GET | `/entities/:id/badges` | Public |
| Badge | GET | `/users/:id/badges` | Public |
| ReviewInvite | POST | `/entities/:id/invites` | Owner |
| ReviewInvite | GET | `/entities/:id/invites` | Owner |
| ReviewInvite | PATCH | `/invites/:id/revoke` | Owner |
| ReviewInvite | GET | `/r/:token` | Public |
| Follow | POST | `/follows` | User |
| Follow | DELETE | `/follows/:targetType/:targetId` | User |
| Follow | GET | `/me/follows` | User |
| Follow | GET | `/entities/:id/followers/count` | Public |
| IssueResolution | POST | `/reviews/:id/mark-resolved` | Owner |
| IssueResolution | POST | `/reviews/:id/confirm-resolved` | User |
| Analytics | GET | `/entities/:id/analytics` | Owner |
| WorkplaceReview | (extends existing review creation) | — | — |
| CategoryExtension | GET | `/entities/:id/category-profile` | Public |
| CategoryExtension | POST | `/entities/:id/category-profile` | Owner |

---

## 7. FRONTEND PLAN (Phase 1)

| Component/Page | Description |
|---|---|
| Entity Profile Enhancement | Tabs: Overview, Reviews, Trust. Show badges, response metrics, employer data when present |
| Follow Button | Toggle follow/unfollow with follower count on entity pages |
| Badge Showcase | Grid of earned badges on entity and user profiles |
| Response Score Bar | Compact: "85% response · 18h avg" |
| Verified Badge Component | Green checkmark with "Verified" tooltip |
| Review Form Extension | Conditional workplace sub-ratings when category = employer |
| Employer Dashboard (basic) | Stats cards, unanswered reviews, invite manager |
| Review Invite Page | Create, list, copy link, WhatsApp share |
| Invite Landing Page | `/r/:token` → redirect to review form |

---

## 8. RANKING + TRUST + MODERATION

### Feed Ranking Enhancement (Phase 2)
```
feedScore = recency*0.35 + quality*0.20 + trust*0.15 + helpful*0.10 + response*0.10 + follow*0.10
```

### Category-Aware Trust Weights
- **Employer**: response_rate(0.15) + salary_signals(0.05)
- **Schools**: teaching_quality(0.15) + parent_weight_boost(1.2x)
- **Medical**: strict_trust_weight(1.5x) + verified_entity_boost(0.10)
- **Products**: recency_weight(0.20) + image_boost(0.05)

### Moderation Rules
- Medical reviews: auto-flag if body contains claim keywords → manual review
- Workplace reviews: enforce minimum body length (50 chars)
- Product reviews: allow image attachments, validate MIME types
- All: existing sanitization, PII detection, risk state assessment
