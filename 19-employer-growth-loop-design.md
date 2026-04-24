# ReviewHistory — Employer Growth Loop + Verified Profile + Response Score
## Full Implementation-Ready Design Document

---

## 1. PRODUCT DECISION SUMMARY

### Why Implement Both Directions Together

Direction A (Verified Employer Profile + Response Score) and Direction B (Growth Loop + Dashboard + Employee Trust) are two halves of the same flywheel. Building one without the other creates a dead-end:

- **Profile without dashboard** = employers claim and leave (no retention)
- **Dashboard without profile** = employers have analytics but no public benefit (no motivation)
- **Response score without review requests** = small review volume means low data quality
- **Gamification without workplace reviews** = generic reviews lack structured insight

Together they form a **closed-loop system**:

```
Employer claims entity → builds verified profile → gets dashboard analytics
→ sends review request links to employees/customers
→ employees submit structured reviews (culture, salary, management)
→ employer responds to reviews → response score improves
→ higher ranking in search/feed → more visibility → more claims
```

### The Flywheel

```
                 ┌─────────────────┐
                 │  EMPLOYER CLAIMS │
                 │  & BUILDS PROFILE│
                 └───────┬─────────┘
                         │
              ┌──────────▼──────────┐
              │ SENDS REVIEW REQUEST │
              │ LINKS TO EMPLOYEES   │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ EMPLOYEES JOIN AND   │
              │ WRITE REVIEWS        │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ EMPLOYER RESPONDS    │
              │ RESPONSE METRICS ↑   │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ TRUST BADGE + RANK   │
              │ BOOST IN SEARCH      │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ MORE VISIBILITY      │
              │ MORE CLAIMS ─────────┘
              └──────────────────────┘
```

### Business Value

| Stakeholder | Value |
|---|---|
| **Employers** | Verified badge, public profile, analytics, response metrics, ranking boost, review request tools |
| **Employees** | Structured workplace reviews, anonymous safety, salary transparency, trust in verified employers |
| **Platform** | Viral growth via review links, employer retention via dashboard, content quality via structured reviews, moat via trust data |

---

## 2. FEATURE PRIORITY — PHASE BREAKDOWN

### Phase 1 — Must Build Now (MVP Core)

| # | Feature | Justification |
|---|---|---|
| 1.1 | Employer/Owner Profile Extension | Claimed entities need a rich public page |
| 1.2 | Employer Dashboard (core) | Analytics, response prompts, profile completion |
| 1.3 | Response Score System | Public metric that motivates employer engagement |
| 1.4 | Review Request / Invite Links | The primary growth loop mechanism |
| 1.5 | Workplace Review Fields | Structured reviews for employer category |
| 1.6 | Basic Badges | Verified Employer, Fast Responder |
| 1.7 | Follow Entities | Personalized feed foundation |

### Phase 2 — Strong Next Features

| # | Feature | Justification |
|---|---|---|
| 2.1 | Salary Transparency (anonymous) | Traffic magnet, key differentiator |
| 2.2 | Advanced Gamification | Reviewer badges, milestones, leaderboard |
| 2.3 | Issue Resolved Flow | Two-way resolution between employer and reviewer |
| 2.4 | Enhanced Feed Ranking | Trust-weighted, responsiveness-boosted ranking |
| 2.5 | Weekly Digest Notifications | Re-engagement via email/SMS |
| 2.6 | Domain Verification for Employers | Higher trust tier for email-verified companies |
| 2.7 | QR Code for Review Requests | Physical location reviews |

### Phase 3 — Advanced / Scale

| # | Feature | Justification |
|---|---|---|
| 3.1 | Interview Experience Reviews | Glassdoor-like candidate reviews |
| 3.2 | Employer Comparison Tool | Side-by-side employer comparison |
| 3.3 | Analytics Export / Reports | PDF reports for employers |
| 3.4 | Employer API Access | Programmatic access to review data |
| 3.5 | AI-Powered Review Summary | Auto-generate pros/cons from review text |
| 3.6 | Competitor Benchmarking | Compare your response rate vs industry |

---

## 3. DATABASE DESIGN

### New Enums

```prisma
enum EmployerSize {
  solo       // 1 person
  micro      // 2-10
  small      // 11-50
  medium     // 51-200
  large      // 201-1000
  enterprise // 1000+
  @@map("employer_size")
}

enum BadgeType {
  verified_employer
  fast_responder
  responsive_employer
  employee_trusted
  top_contributor
  trusted_reviewer
  first_review
  five_reviews
  ten_reviews
  @@map("badge_type")
}

enum InviteStatus {
  active
  expired
  revoked
  @@map("invite_status")
}

enum IssueResolutionStatus {
  open
  resolved_by_owner
  confirmed_resolved
  disputed
  @@map("issue_resolution_status")
}

enum FollowTargetType {
  entity
  category
  @@map("follow_target_type")
}

enum AnalyticsEventType {
  entity_page_view
  review_request_sent
  review_request_opened
  review_request_converted
  profile_view
  search_impression
  @@map("analytics_event_type")
}
```

### New Models

```prisma
// ─── EMPLOYER PROFILE ──────────────────────────────────

model EmployerProfile {
  id              String        @id @default(uuid()) @db.Uuid
  entityId        String        @unique @map("entity_id") @db.Uuid
  description     String?       @db.Text
  logoUrl         String?       @map("logo_url") @db.VarChar(500)
  coverImageUrl   String?       @map("cover_image_url") @db.VarChar(500)
  websiteUrl      String?       @map("website_url") @db.VarChar(500)
  industry        String?       @db.VarChar(100)
  employerSize    EmployerSize? @map("employer_size")
  foundedYear     Int?          @map("founded_year") @db.SmallInt
  benefitsJson    Json?         @map("benefits_json")   // ["health insurance","transport","meals"]
  socialLinksJson Json?         @map("social_links_json") // {facebook:"",linkedin:"",twitter:""}
  isVerified      Boolean       @default(false) @map("is_verified")
  verifiedAt      DateTime?     @map("verified_at")
  verifiedMethod  String?       @map("verified_method") @db.VarChar(50)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  entity Entity @relation(fields: [entityId], references: [id])

  @@map("employer_profiles")
}

// ─── RESPONSE METRICS (materialized per entity) ────────

model EntityResponseMetric {
  id                    String   @id @default(uuid()) @db.Uuid
  entityId              String   @unique @map("entity_id") @db.Uuid
  totalReviews          Int      @default(0) @map("total_reviews")
  repliedReviews        Int      @default(0) @map("replied_reviews")
  responseRate          Decimal  @default(0) @map("response_rate") @db.Decimal(5, 2)   // 0.00 – 100.00
  avgResponseTimeHours  Decimal  @default(0) @map("avg_response_time_hours") @db.Decimal(8, 2)
  issuesResolvedCount   Int      @default(0) @map("issues_resolved_count")
  lastRepliedAt         DateTime? @map("last_replied_at")
  recalculatedAt        DateTime @default(now()) @map("recalculated_at")

  entity Entity @relation(fields: [entityId], references: [id])

  @@index([responseRate(sort: Desc)])
  @@map("entity_response_metrics")
}

// ─── BADGES ────────────────────────────────────────────

model Badge {
  id          String    @id @default(uuid()) @db.Uuid
  badgeType   BadgeType @map("badge_type")
  targetType  String    @map("target_type") @db.VarChar(20) // 'user' | 'entity'
  targetId    String    @map("target_id") @db.Uuid
  awardedAt   DateTime  @default(now()) @map("awarded_at")
  expiresAt   DateTime? @map("expires_at")

  @@unique([badgeType, targetType, targetId])
  @@index([targetType, targetId])
  @@map("badges")
}

// ─── WORKPLACE REVIEW FIELDS ───────────────────────────

model WorkplaceReviewData {
  id                 String   @id @default(uuid()) @db.Uuid
  reviewId           String   @unique @map("review_id") @db.Uuid
  workCulture        Int?     @map("work_culture") @db.SmallInt        // 1-5
  salaryFairness     Int?     @map("salary_fairness") @db.SmallInt     // 1-5
  managementQuality  Int?     @map("management_quality") @db.SmallInt  // 1-5
  careerGrowth       Int?     @map("career_growth") @db.SmallInt       // 1-5
  workLifeBalance    Int?     @map("work_life_balance") @db.SmallInt   // 1-5
  benefitsSatisfaction Int?   @map("benefits_satisfaction") @db.SmallInt // 1-5
  recommendScore     Int?     @map("recommend_score") @db.SmallInt     // 1-10 NPS-style
  employmentStatus   String?  @map("employment_status") @db.VarChar(30) // current/former
  jobTitle           String?  @map("job_title") @db.VarChar(100)
  departmentName     String?  @map("department_name") @db.VarChar(100)
  yearsAtCompany     Int?     @map("years_at_company") @db.SmallInt
  createdAt          DateTime @default(now()) @map("created_at")

  review Review @relation(fields: [reviewId], references: [id])

  @@map("workplace_review_data")
}

// ─── SALARY SUBMISSIONS (anonymous) ────────────────────

model SalarySubmission {
  id             String   @id @default(uuid()) @db.Uuid
  entityId       String   @map("entity_id") @db.Uuid
  authorUserId   String   @map("author_user_id") @db.Uuid
  jobTitle       String   @map("job_title") @db.VarChar(100)
  departmentName String?  @map("department_name") @db.VarChar(100)
  salaryMin      Int      @map("salary_min")  // monthly PKR
  salaryMax      Int      @map("salary_max")
  currency       String   @default("PKR") @db.VarChar(3)
  employmentType String   @map("employment_type") @db.VarChar(30) // full_time/part_time/contract/intern
  experienceYears Int?    @map("experience_years") @db.SmallInt
  isVerified     Boolean  @default(false) @map("is_verified")
  status         String   @default("published") @db.VarChar(20)
  createdAt      DateTime @default(now()) @map("created_at")

  entity Entity @relation(fields: [entityId], references: [id])
  author User   @relation(fields: [authorUserId], references: [id])

  @@index([entityId, jobTitle])
  @@index([entityId, status])
  @@map("salary_submissions")
}

// ─── REVIEW INVITE LINKS ──────────────────────────────

model ReviewInvite {
  id             String       @id @default(uuid()) @db.Uuid
  entityId       String       @map("entity_id") @db.Uuid
  createdByUserId String      @map("created_by_user_id") @db.Uuid
  token          String       @unique @db.VarChar(64)
  label          String?      @db.VarChar(100)  // "Q1 Employee Survey", "Customer Feedback"
  status         InviteStatus @default(active)
  maxUses        Int?         @map("max_uses")
  useCount       Int          @default(0) @map("use_count")
  openCount      Int          @default(0) @map("open_count")
  expiresAt      DateTime?    @map("expires_at")
  createdAt      DateTime     @default(now()) @map("created_at")

  entity    Entity @relation(fields: [entityId], references: [id])
  createdBy User   @relation(fields: [createdByUserId], references: [id])

  @@index([token])
  @@index([entityId])
  @@map("review_invites")
}

// ─── ISSUE RESOLUTION ──────────────────────────────────

model IssueResolution {
  id             String                @id @default(uuid()) @db.Uuid
  reviewId       String                @map("review_id") @db.Uuid
  replyId        String                @map("reply_id") @db.Uuid
  status         IssueResolutionStatus @default(open)
  resolvedAt     DateTime?             @map("resolved_at")
  confirmedAt    DateTime?             @map("confirmed_at")  // reviewer confirms resolution
  createdAt      DateTime              @default(now()) @map("created_at")
  updatedAt      DateTime              @updatedAt @map("updated_at")

  review Review      @relation(fields: [reviewId], references: [id])
  reply  ReviewReply @relation(fields: [replyId], references: [id])

  @@unique([reviewId])
  @@map("issue_resolutions")
}

// ─── FOLLOW SYSTEM ─────────────────────────────────────

model Follow {
  id         String           @id @default(uuid()) @db.Uuid
  userId     String           @map("user_id") @db.Uuid
  targetType FollowTargetType @map("target_type")
  targetId   String           @map("target_id") @db.Uuid
  createdAt  DateTime         @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId])
  @@index([targetType, targetId])
  @@index([userId])
  @@map("follows")
}

// ─── ANALYTICS EVENTS ──────────────────────────────────

model AnalyticsEvent {
  id         String             @id @default(uuid()) @db.Uuid
  eventType  AnalyticsEventType @map("event_type")
  entityId   String?            @map("entity_id") @db.Uuid
  userId     String?            @map("user_id") @db.Uuid
  inviteId   String?            @map("invite_id") @db.Uuid
  metadataJson Json?            @map("metadata_json")
  ipHash     String?            @map("ip_hash") @db.VarChar(64)
  createdAt  DateTime           @default(now()) @map("created_at")

  @@index([eventType, entityId])
  @@index([entityId, createdAt(sort: Desc)])
  @@index([inviteId])
  @@map("analytics_events")
}
```

### Existing Model Changes

```prisma
// ADD to Entity model:
  employerProfile     EmployerProfile?
  responseMetric      EntityResponseMetric?
  salarySubmissions   SalarySubmission[]
  reviewInvites       ReviewInvite[]
  // (existing fields remain unchanged)

// ADD to Review model:
  workplaceData       WorkplaceReviewData?
  issueResolution     IssueResolution?

// ADD to ReviewReply model:
  issueResolution     IssueResolution?

// ADD to User model:
  follows             Follow[]
  salarySubmissions   SalarySubmission[]
  reviewInvites       ReviewInvite[]
```

### Migration Strategy

All new tables are additive. Zero breaking changes to existing schema.
- New relation fields are optional (nullable)
- WorkplaceReviewData is a 1:1 optional child of Review
- EmployerProfile is a 1:1 optional child of Entity
- EntityResponseMetric is materialized view — recalculated periodically or on reply events

---

## 4. BACKEND MODULE DESIGN

### 4.1 EmployerProfileModule

**Purpose**: Manage employer/owner profiles for claimed entities

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/entities/:id/employer-profile` | Public | Get employer profile |
| POST | `/entities/:id/employer-profile` | Owner | Create employer profile |
| PATCH | `/entities/:id/employer-profile` | Owner | Update employer profile |
| POST | `/admin/entities/:id/verify-employer` | Admin | Mark employer as verified |

**DTOs**:
```
CreateEmployerProfileDto:
  description?: string (max 2000)
  logoUrl?: string (URL validation)
  coverImageUrl?: string (URL validation)
  websiteUrl?: string (URL validation)
  industry?: string (max 100)
  employerSize?: EmployerSize enum
  foundedYear?: number (1900-current)
  benefits?: string[] (max 20 items, each max 100 chars)
  socialLinks?: { facebook?: string, linkedin?: string, twitter?: string }

UpdateEmployerProfileDto: same as Create, all optional
```

**Service Responsibilities**:
- Validate that the requesting user is the claimed owner of the entity
- Sanitize all text inputs
- Validate URLs (no javascript: or data: URIs)
- Calculate profile completion percentage
- On verification: set isVerified=true, award `verified_employer` badge

**Role Rules**:
- Create/Update: only `claimed_owner` for that entity, or `admin`
- Verification: only `admin` or `super_admin`

**Events Emitted**:
- `employer_profile.created`
- `employer_profile.updated`
- `employer_profile.verified`

---

### 4.2 ResponseMetricModule

**Purpose**: Track and expose employer response metrics

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/entities/:id/response-metrics` | Public | Get response metrics |
| POST | `/admin/response-metrics/recalculate/:entityId` | Admin | Force recalculation |

**Service Responsibilities**:
- `recalculateMetrics(entityId)`:
  1. Count total published reviews for entity
  2. Count reviews that have at least one published reply from claimed_owner
  3. Calculate response rate = replied / total * 100
  4. Calculate average response time = avg(first_reply.createdAt - review.publishedAt) in hours
  5. Count issue resolutions where status = confirmed_resolved
  6. Update EntityResponseMetric row (upsert)
- Triggered by: ReviewReply creation, IssueResolution update, or scheduled cron
- Award/revoke badges based on thresholds

**Badge Rules**:
| Badge | Condition |
|---|---|
| `fast_responder` | avg response time < 24 hours AND response rate > 50% AND min 5 reviews |
| `responsive_employer` | response rate > 80% AND min 10 reviews |
| `employee_trusted` | avg rating > 3.5 from workplace reviews AND min 10 workplace reviews |

---

### 4.3 WorkplaceReviewModule

**Purpose**: Extend review creation with structured workplace fields

**Implementation**: Not a new standalone module. Instead, extend `ReviewsService.create()`:
- If entity's category is `employer` / `workplace` / or any configured workplace category, accept additional workplace fields
- Store in `WorkplaceReviewData` as 1:1 child of Review

**Additional DTO fields** (added to CreateReviewDto when category is workplace):
```
workCulture?: number (1-5)
salaryFairness?: number (1-5)
managementQuality?: number (1-5)
careerGrowth?: number (1-5)
workLifeBalance?: number (1-5)
benefitsSatisfaction?: number (1-5)
recommendScore?: number (1-10)
employmentStatus?: 'current' | 'former'
jobTitle?: string (max 100)
departmentName?: string (max 100)
yearsAtCompany?: number (0-50)
```

**Validation Rules**:
- Sub-ratings 1-5 only
- recommendScore 1-10 only
- If any workplace field is provided, at least 3 sub-ratings must be filled
- jobTitle is sanitized and trimmed

---

### 4.4 SalaryInsightModule

**Purpose**: Anonymous salary data submissions and aggregation

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/entities/:id/salaries` | User | Submit salary data |
| GET | `/entities/:id/salaries` | Public | Get aggregated salary ranges |

**DTOs**:
```
CreateSalaryDto:
  jobTitle: string (required, max 100)
  departmentName?: string (max 100)
  salaryMin: number (required, > 0)
  salaryMax: number (required, >= salaryMin)
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern'
  experienceYears?: number (0-50)
```

**Service Responsibilities**:
- Never expose individual submissions — only aggregate (min 3 submissions per job title before showing)
- Return grouped by job title: { jobTitle, count, minSalary, maxSalary, medianSalary, avgSalary }
- One submission per user per entity per job title
- Sanitize job title to prevent PII leakage in title field

**Role Rules**: Any authenticated `user` can submit. Public can view aggregates.

---

### 4.5 ReviewInviteModule

**Purpose**: Generate shareable review request links

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/entities/:id/invites` | Owner | Create invite link |
| GET | `/entities/:id/invites` | Owner | List my invite links |
| PATCH | `/invites/:id/revoke` | Owner | Revoke an invite |
| GET | `/r/:token` | Public | Resolve invite token → entity info |

**DTOs**:
```
CreateInviteDto:
  label?: string (max 100, e.g., "Q1 Employee Survey")
  maxUses?: number (1-1000, optional)
  expiresInDays?: number (1-365, default 30)
```

**Service Responsibilities**:
- Generate cryptographically random 32-byte hex token
- Owner must have approved claim for the entity
- Max 20 active invites per entity
- On resolve (`GET /r/:token`):
  1. Validate token exists, status=active, not expired, use count < max
  2. Increment openCount
  3. Log `review_request_opened` analytics event
  4. Return entity info + category to redirect to review form
- When review is submitted from invite flow, log `review_request_converted` and increment useCount

**Abuse Prevention**:
- Token is one-way (can't enumerate entities from tokens)
- Rate limit: max 50 invite resolutions per IP per hour
- Expired invites are cleaned up via scheduled job

---

### 4.6 BadgeModule

**Purpose**: Award, revoke, and query badges for users and entities

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/entities/:id/badges` | Public | Get entity badges |
| GET | `/users/:id/badges` | Public | Get user badges |
| POST | `/admin/badges/recalculate` | Admin | Recalculate all badges |

**Service Responsibilities**:
- `evaluateEntityBadges(entityId)`: Check thresholds, upsert badges
- `evaluateUserBadges(userId)`: Check review count, helpful votes, trust level
- Called after: review created, reply created, response metrics updated, trust recalculated

**User Badge Rules**:
| Badge | Condition |
|---|---|
| `first_review` | 1+ published review |
| `five_reviews` | 5+ published reviews |
| `ten_reviews` | 10+ published reviews |
| `top_contributor` | 20+ published reviews AND trust level = trusted |
| `trusted_reviewer` | trust level = trusted AND 10+ helpful votes received |

---

### 4.7 FollowModule

**Purpose**: Follow entities or categories

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/follows` | User | Follow an entity or category |
| DELETE | `/follows/:targetType/:targetId` | User | Unfollow |
| GET | `/me/follows` | User | List my follows |
| GET | `/entities/:id/followers/count` | Public | Get follower count |

**DTOs**:
```
CreateFollowDto:
  targetType: 'entity' | 'category'
  targetId: string (UUID)
```

**Service Responsibilities**:
- Unique constraint prevents duplicate follows
- Max 200 follows per user
- Used by feed ranking to boost followed entities

---

### 4.8 IssueResolutionModule

**Purpose**: Track issue resolution after owner replies

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/reviews/:id/mark-resolved` | Owner | Owner marks issue as resolved |
| POST | `/reviews/:id/confirm-resolved` | User | Original reviewer confirms resolution |
| POST | `/reviews/:id/dispute-resolution` | User | Reviewer disputes the resolution |

**Service Responsibilities**:
- Only the entity's claimed owner can initiate resolution (must have a reply first)
- Only the original review author can confirm or dispute
- Confirmed resolutions increment `issuesResolvedCount` in response metrics
- Notification sent to reviewer when owner marks resolved
- Notification sent to owner when reviewer confirms/disputes

---

### 4.9 AnalyticsModule (Extensions)

**Purpose**: Track page views, invite conversions, search impressions

**Endpoints**:
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/analytics/event` | Public | Log an analytics event (rate-limited) |
| GET | `/entities/:id/analytics` | Owner | Get entity analytics summary |

**Service Responsibilities**:
- `logEvent(type, entityId, userId?, inviteId?, metadata?)`: Insert analytics event with IP hash
- `getEntityAnalytics(entityId, period)`: Aggregate page views, invite stats, review velocity
- Rate limit: 10 events per IP per minute (prevent abuse)
- IP is hashed before storage (no raw IPs)

**Analytics Summary Response**:
```json
{
  "pageViews": { "last7d": 145, "last30d": 520, "trend": "+12%" },
  "reviewVelocity": { "last7d": 3, "last30d": 8 },
  "inviteStats": {
    "totalSent": 25,
    "totalOpened": 18,
    "totalConverted": 7,
    "conversionRate": 38.9
  },
  "topPraise": ["good management", "fair salary"],
  "topComplaints": ["long hours", "no growth"]
}
```

---

### 4.10 Feed Ranking Extensions

**Current**: Feed sorts by `publishedAt DESC`
**Enhanced**: Feed uses a composite score

**Ranking Formula**:
```
feedScore =
    recencyScore(publishedAt)           * 0.35
  + reviewQualityScore(bodyLength, tags) * 0.20
  + entityTrustScore(trustScore/100)     * 0.15
  + helpfulRatio(helpful / totalVotes)   * 0.10
  + responseBonus(isVerified, hasReply)  * 0.10
  + followBonus(userFollowsEntity)       * 0.10
```

Where:
- `recencyScore`: 1.0 for < 1 day, decays linearly to 0.0 at 90 days
- `reviewQualityScore`: body > 100 chars = 0.5, has tags = +0.3, has title = +0.2
- `responseBonus`: verified entity = +0.05, entity replied to this review = +0.05
- `followBonus`: 0.10 if user follows this entity, else 0.0

**Implementation**: Compute at query time using SQL expressions initially. If load requires it, materialize as a cron-updated column later.

**Search Ranking Enhancement**:
Add to search ordering options: `sort=recommended` which uses:
```
searchScore =
    textRelevance          * 0.30
  + averageRating/5        * 0.20
  + trustScore/100         * 0.20
  + responseRate/100       * 0.15
  + log(reviewCount+1)/5   * 0.10
  + isVerified ? 0.05 : 0  * 0.05
```

---

## 5. API DOCUMENTATION

### Employer Profile

```
POST /api/v1/entities/:entityId/employer-profile
Auth: Bearer (claimed_owner of entity)
Body: {
  "description": "Leading software company in Lahore",
  "websiteUrl": "https://example.com",
  "industry": "Technology",
  "employerSize": "medium",
  "foundedYear": 2015,
  "benefits": ["Health Insurance", "Flexible Hours", "Transport"],
  "socialLinks": { "linkedin": "https://linkedin.com/company/example" }
}
Response 201: {
  "success": true,
  "data": {
    "id": "uuid",
    "entityId": "uuid",
    "description": "...",
    "profileCompletionPercent": 75,
    "isVerified": false
  }
}
Validation: URLs must be https. Description max 2000 chars. Benefits max 20 items.
```

```
GET /api/v1/entities/:entityId/employer-profile
Auth: Public
Response 200: {
  "success": true,
  "data": {
    "id": "uuid",
    "description": "...",
    "logoUrl": "...",
    "coverImageUrl": "...",
    "websiteUrl": "...",
    "industry": "Technology",
    "employerSize": "medium",
    "foundedYear": 2015,
    "benefits": ["Health Insurance", "Flexible Hours"],
    "socialLinks": { "linkedin": "..." },
    "isVerified": true,
    "verifiedAt": "2026-03-15T...",
    "profileCompletionPercent": 90
  }
}
```

### Response Metrics

```
GET /api/v1/entities/:entityId/response-metrics
Auth: Public
Response 200: {
  "success": true,
  "data": {
    "responseRate": 85.5,
    "avgResponseTimeHours": 18.3,
    "issuesResolvedCount": 12,
    "totalReviews": 45,
    "repliedReviews": 38,
    "lastRepliedAt": "2026-04-18T..."
  }
}
```

### Review Invite Links

```
POST /api/v1/entities/:entityId/invites
Auth: Bearer (claimed_owner)
Body: {
  "label": "Q1 Customer Feedback",
  "maxUses": 100,
  "expiresInDays": 30
}
Response 201: {
  "success": true,
  "data": {
    "id": "uuid",
    "token": "a1b2c3d4...",
    "shareUrl": "https://reviewhistory.pk/r/a1b2c3d4...",
    "qrCodeUrl": "https://api.reviewhistory.pk/r/a1b2c3d4.../qr",
    "expiresAt": "2026-05-20T..."
  }
}
```

```
GET /api/v1/r/:token
Auth: Public
Response 200: {
  "success": true,
  "data": {
    "entityId": "uuid",
    "entityName": "ABC Company",
    "categoryKey": "employer",
    "categoryName": "Employer",
    "inviteLabel": "Q1 Customer Feedback"
  }
}
If expired: Response 410: { "success": false, "message": "This review link has expired" }
```

### Workplace Review (extension of existing review creation)

```
POST /api/v1/entities/:entityId/reviews
Auth: Bearer (user)
Body: {
  "overallRating": 4,
  "title": "Good workplace, some issues",
  "body": "I worked here for 2 years...",
  "tagKeys": ["good_management", "low_salary"],
  "workplace": {
    "workCulture": 4,
    "salaryFairness": 3,
    "managementQuality": 4,
    "careerGrowth": 3,
    "workLifeBalance": 5,
    "benefitsSatisfaction": 3,
    "recommendScore": 7,
    "employmentStatus": "former",
    "jobTitle": "Software Engineer",
    "yearsAtCompany": 2
  }
}
Response 201: { "reviewId": "uuid", "status": "published" }
```

### Salary Submission

```
POST /api/v1/entities/:entityId/salaries
Auth: Bearer (user)
Body: {
  "jobTitle": "Software Engineer",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "employmentType": "full_time",
  "experienceYears": 3
}
Response 201: { "id": "uuid", "message": "Salary data submitted" }
```

```
GET /api/v1/entities/:entityId/salaries
Auth: Public
Response 200: {
  "data": [
    {
      "jobTitle": "Software Engineer",
      "count": 5,
      "minSalary": 60000,
      "maxSalary": 180000,
      "medianSalary": 100000,
      "avgSalary": 106000
    }
  ]
}
Note: Only shows job titles with 3+ submissions
```

### Follow

```
POST /api/v1/follows
Auth: Bearer
Body: { "targetType": "entity", "targetId": "uuid" }
Response 201: { "id": "uuid" }
```

```
DELETE /api/v1/follows/entity/:targetId
Auth: Bearer
Response 200: { "message": "Unfollowed" }
```

### Issue Resolution

```
POST /api/v1/reviews/:reviewId/mark-resolved
Auth: Bearer (claimed_owner of the entity)
Response 200: { "status": "resolved_by_owner" }
→ Notification sent to review author

POST /api/v1/reviews/:reviewId/confirm-resolved
Auth: Bearer (original review author only)
Response 200: { "status": "confirmed_resolved" }
→ issuesResolvedCount++ on entity metrics
```

### Entity Analytics (Owner Dashboard)

```
GET /api/v1/entities/:entityId/analytics?period=30d
Auth: Bearer (claimed_owner or admin)
Response 200: {
  "pageViews": { "last7d": 145, "last30d": 520, "trend": "+12%" },
  "reviewVelocity": { "last7d": 3, "last30d": 8 },
  "inviteStats": { "totalSent": 25, "totalOpened": 18, "totalConverted": 7, "conversionRate": 38.9 },
  "ratingDistribution": { "1": 2, "2": 1, "3": 5, "4": 12, "5": 25 },
  "responseMetrics": { "responseRate": 85.5, "avgResponseTimeHours": 18.3 },
  "topTags": [
    { "key": "good_management", "count": 15, "isPositive": true },
    { "key": "low_salary", "count": 8, "isPositive": false }
  ]
}
```

### Badges

```
GET /api/v1/entities/:entityId/badges
Auth: Public
Response 200: {
  "data": [
    { "badgeType": "verified_employer", "awardedAt": "2026-03-15T..." },
    { "badgeType": "fast_responder", "awardedAt": "2026-04-01T..." }
  ]
}
```

---

## 6. BUSINESS RULES

### Claim Rules
1. Any authenticated user can submit ONE claim per entity
2. Cannot claim an entity that is already claimed (status=approved) by another user
3. Claim requires verification method: `phone_otp`, `document`, or `business_email`
4. Pending claim auto-expires after 30 days if not reviewed by admin
5. Rejected claims can be re-submitted after 7 days with new evidence
6. On approval: user.role → `claimed_owner`, entity.isClaimed → true

### Verification Rules (Verified Employer Badge)
1. Must have approved claim first
2. Admin manually verifies via one of:
   - Business registration document review
   - Domain email verification (company sends email from matching domain)
   - Physical verification (for local businesses)
3. Verification can be revoked by admin with reason
4. `isVerified` is separate from `isClaimed` — a claimed entity is not automatically verified

### Badge Awarding Rules
| Badge | Award When | Revoke When |
|---|---|---|
| `verified_employer` | Admin verifies entity | Admin revokes verification |
| `fast_responder` | avg response < 24h AND rate > 50% AND 5+ reviews | Metrics drop below threshold for 30 days |
| `responsive_employer` | response rate > 80% AND 10+ reviews | Rate drops below 70% for 30 days |
| `employee_trusted` | avg workplace rating > 3.5 AND 10+ workplace reviews | Rating drops below 3.0 |
| `first_review` | User publishes 1st review | Never (permanent) |
| `five_reviews` | User reaches 5 published | Never (permanent) |
| `ten_reviews` | User reaches 10 published | Never (permanent) |
| `top_contributor` | 20+ reviews AND trusted | Trust level drops |
| `trusted_reviewer` | Trusted level AND 10+ helpful votes | Trust level drops |

### Response Score Formula
```
responseScore = (responseRate * 0.40) + (speedScore * 0.30) + (resolutionScore * 0.30)

Where:
  responseRate = repliedReviews / totalReviews * 100   (capped at 100)
  speedScore = max(0, 100 - (avgResponseTimeHours / 2.4)) (100 at 0h, 0 at 240h/10d)
  resolutionScore = min(100, issuesResolved / max(1, totalNegativeReviews) * 100)
```

### Ranking Boost Logic
- Verified & responsive entities get a **slight** boost (max +5% to +10% of total score)
- The boost is transparent to users (badge displayed, not hidden algorithm)
- Boost never overrides a genuinely better-rated entity
- Search results show a small "Verified" or "Responsive" indicator — users understand why it ranks

### Anonymous Review Trust Weighting
- Named reviews where author.trustLevel = `trusted`: weight = 1.0
- Named reviews where author.trustLevel = `established`: weight = 0.85
- Named reviews where author.trustLevel = `new_user`: weight = 0.7
- Anonymous reviews: weight = 0.5
- These weights affect the entity's trustScore calculation, NOT the displayed average rating
- Average rating is always the raw mathematical average (transparency)

### Salary Submission Rules
1. One submission per user per entity per job title
2. Salary max must be >= salary min
3. Salary values must be > 0 and < 50,000,000 PKR
4. Job title is normalized (trimmed, title-cased)
5. Aggregates only shown when 3+ submissions exist for a job title
6. Individual submissions are NEVER exposed via API

### Invite Link Rules
1. Only claimed owner can create invites for their entity
2. Max 20 active invites per entity
3. Default expiry: 30 days (configurable 1-365)
4. Token: 32-byte cryptographically random hex string
5. Invite can be revoked by owner anytime
6. When maxUses reached, status auto-changes to `expired`
7. Expired/revoked invites return 410 Gone

### Moderation and Abuse Rules
1. Workplace reviews with sub-ratings are held for automated quality check (body must be > 50 chars)
2. Salary submissions from accounts < 24h old are quarantined for manual review
3. Multiple reviews from same IP within 1 hour for same entity are flagged
4. Business owners cannot review their own entity
5. All claim actions are audit-logged
6. All moderation actions include actor ID and timestamp
7. PII in anonymous reviews (detected names, phone numbers) triggers auto-flag

---

## 7. UI / UX TASKS

### 7.1 Employer Public Profile Page
```
Route: /entities/:id (enhanced)
Layout:
┌─────────────────────────────────────────────────┐
│ [Cover Image - full width, 200px height]        │
│  ┌──────┐                                       │
│  │ Logo │  Entity Name          [Verified ✓]    │
│  └──────┘  Industry · City · Size               │
│            ★★★★☆ 4.2 (145 reviews)              │
│            [Follow] [Write Review] [Share]       │
│                                                  │
│  Response Score Bar:                             │
│  85% response rate · 18h avg · 12 resolved      │
│  [🏆 Fast Responder] [✓ Verified Employer]      │
├─────────────────────────────────────────────────┤
│ TABS: Overview | Reviews | Salaries | Trust      │
├─────────────────────────────────────────────────┤
│ Overview Tab:                                    │
│  - About section (description)                   │
│  - Benefits/perks pills                          │
│  - Workplace ratings breakdown chart (radar)     │
│  - Website + social links                        │
│  - Location on map (future)                      │
├─────────────────────────────────────────────────┤
│ Reviews Tab: (existing, enhanced)                │
│  - Filter: All / Workplace / General             │
│  - Workplace reviews show sub-rating bars        │
│  - Owner replies highlighted with badge          │
│  - "Issue Resolved ✓" indicator on resolved      │
├─────────────────────────────────────────────────┤
│ Salaries Tab:                                    │
│  - Salary ranges by job title (bar chart)        │
│  - "Add Your Salary" button                      │
│  - Min 3 submissions message if < 3              │
├─────────────────────────────────────────────────┤
│ Trust Tab: (existing trust breakdown, enhanced)  │
│  - Response metrics card                         │
│  - Badge showcase                                │
│  - Trust score history chart                     │
└─────────────────────────────────────────────────┘
```

### 7.2 Employer Dashboard
```
Route: /dashboard/employer (claimed owners only)
Layout:
┌─────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT                 │
│ ─ Overview       │                               │
│ ─ Reviews        │  ┌──────────────────────────┐ │
│ ─ Analytics      │  │ Profile Completion: 75%  │ │
│ ─ Invite Links   │  │ ████████░░░░ Complete it │ │
│ ─ Profile        │  └──────────────────────────┘ │
│ ─ Badges         │                               │
│                  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│                  │  │ 4.2│ │145 │ │85% │ │18h │ │
│                  │  │Avg │ │Rev │ │Resp│ │Avg │ │
│                  │  │Rate│ │iews│ │Rate│ │Time│ │
│                  │  └────┘ └────┘ └────┘ └────┘ │
│                  │                               │
│                  │  Rating Trend Chart (30d)      │
│                  │  ┌──────────────────────────┐ │
│                  │  │ 📈 Line chart            │ │
│                  │  └──────────────────────────┘ │
│                  │                               │
│                  │  Unanswered Reviews            │
│                  │  ┌──────────────────────────┐ │
│                  │  │ "Bad experience..." [Reply]││
│                  │  │ "Rude staff..." [Reply]   ││
│                  │  └──────────────────────────┘ │
│                  │                               │
│                  │  Top Praise / Top Complaints   │
│                  │  ┌────────────┬─────────────┐ │
│                  │  │ 👍 Good   │ 👎 Long     │ │
│                  │  │ management│ hours        │ │
│                  │  │ Fair pay  │ No growth    │ │
│                  │  └────────────┴─────────────┘ │
└─────────────────────────────────────────────────┘
```

### 7.3 Review Invite Generator
```
Route: /dashboard/employer/invites
┌─────────────────────────────────────────────────┐
│ Review Request Links                             │
│                                                  │
│ [+ Create New Link]                              │
│                                                  │
│ ┌──────────────────────────────────────────────┐│
│ │ "Q1 Employee Survey"                         ││
│ │ Created Apr 1 · Expires Apr 30               ││
│ │ 18 opened · 7 reviews · 38.9% conversion     ││
│ │                                              ││
│ │ reviewhistory.pk/r/a1b2c3d4...               ││
│ │ [📋 Copy] [📱 WhatsApp] [QR Code] [Revoke]  ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ ┌──────────────────────────────────────────────┐│
│ │ "Customer Feedback Card"                     ││
│ │ Created Mar 15 · Expired                     ││
│ │ 45 opened · 12 reviews · 26.7% conversion    ││
│ └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘

WhatsApp share opens:
"Hi! Please share your experience with [Entity Name] on ReviewHistory:
reviewhistory.pk/r/a1b2c3d4..."
```

### 7.4 Workplace Review Form Extension
```
Route: /entities/:id/review (enhanced for workplace categories)
Shows standard review form PLUS:
┌─────────────────────────────────────────────────┐
│ Workplace Details (optional)                     │
│                                                  │
│ Your Role: [Software Engineer        ]           │
│ Department: [Engineering              ]          │
│ Employment: (●) Current  (○) Former              │
│ Years at Company: [2]                            │
│                                                  │
│ Rate These Areas:                                │
│ Work Culture       ★★★★☆                         │
│ Salary Fairness    ★★★☆☆                         │
│ Management         ★★★★☆                         │
│ Career Growth      ★★★☆☆                         │
│ Work-Life Balance  ★★★★★                         │
│ Benefits           ★★★☆☆                         │
│                                                  │
│ Would you recommend? [7/10] ████████░░           │
└─────────────────────────────────────────────────┘
```

### 7.5 Additional UI Components

| Component | Location | Description |
|---|---|---|
| `VerifiedBadge` | Entity card, profile header | Green checkmark with "Verified" tooltip |
| `ResponseScoreBar` | Entity profile, search cards | Compact bar: "85% response · 18h avg" |
| `BadgeShowcase` | Entity profile, user profile | Grid of earned badges with icons |
| `FollowButton` | Entity profile header | Toggle button with follower count |
| `IssueResolvedBanner` | Review card | Green banner: "✓ Issue resolved" |
| `SalaryChart` | Entity salaries tab | Horizontal bar chart of salary ranges |
| `WorkplaceRatingBars` | Review card, entity overview | 6 horizontal bars for sub-ratings |
| `InviteShareModal` | Employer dashboard | Copy link, WhatsApp share, QR display |
| `ProfileCompletionCard` | Employer dashboard | Progress bar with completion tips |
| `ReviewReplyPrompt` | Employer dashboard | Card with unanswered review + reply CTA |

---

## 8. IMPLEMENTATION PLAN

### Phase 1 — Sprint 1-2: Foundation (Backend First)

**Sprint 1 (Backend)**:
| Task | Dependency | Effort |
|---|---|---|
| Prisma migration: EmployerProfile, EntityResponseMetric, Badge, WorkplaceReviewData | None | M |
| EmployerProfileModule: service + controller + DTOs | Migration | L |
| ResponseMetricModule: service + recalculation logic | Migration | M |
| BadgeModule: service + evaluation logic | Migration | M |
| Extend ReviewsService: accept workplace fields | Migration | M |

**Sprint 2 (Backend + Frontend Start)**:
| Task | Dependency | Effort |
|---|---|---|
| Prisma migration: ReviewInvite, Follow, IssueResolution, AnalyticsEvent, SalarySubmission | None | M |
| ReviewInviteModule: service + controller + token generation | Migration | L |
| FollowModule: service + controller | Migration | S |
| IssueResolutionModule: service + controller | Migration | M |
| SalaryInsightModule: service + aggregation queries | Migration | M |
| Begin employer profile page UI | EmployerProfile API ready | L |

### Phase 1 — Sprint 3-4: Frontend

**Sprint 3 (Frontend)**:
| Task | Dependency | Effort |
|---|---|---|
| Employer public profile page (cover, logo, description, benefits, badges) | Profile API | XL |
| Enhanced entity detail page (tabs: Overview/Reviews/Salaries/Trust) | Profile + Salary API | L |
| Follow button component + hook | Follow API | S |
| Verified badge + response score bar components | Badge + Metrics API | S |
| Workplace review form extension (sub-ratings, job title) | Workplace API | M |

**Sprint 4 (Frontend)**:
| Task | Dependency | Effort |
|---|---|---|
| Employer dashboard: overview, stats cards, rating trend chart | Analytics API | XL |
| Employer dashboard: unanswered reviews list with reply CTA | Reviews + Reply API | M |
| Review invite generator page (create, list, copy, WhatsApp share) | Invite API | L |
| Salary insight tab (chart, add salary form) | Salary API | M |
| Issue resolved interaction on review cards | Resolution API | S |

### Phase 2 — Sprint 5-6: Engagement

**Sprint 5**:
| Task | Dependency | Effort |
|---|---|---|
| User badge showcase on profile page | Badge API | M |
| Enhanced feed ranking (composite score) | Feed API refactor | L |
| Enhanced search ranking (recommended sort) | Search API refactor | L |
| Notification extensions (helpful vote, reply, resolution) | Notification service | M |

**Sprint 6**:
| Task | Dependency | Effort |
|---|---|---|
| QR code generation for invite links | Invite module | S |
| Personalized feed (followed entities boost) | Follow module | M |
| Analytics events tracking (page views, invite conversion) | Analytics module | M |
| Admin verification workflow for employers | Admin module | M |

### Phase 3 — Sprint 7+: Scale

| Task | Effort |
|---|---|
| Domain email verification for employers | L |
| Weekly digest email/SMS | L |
| Interview experience review type | M |
| Employer comparison tool | L |
| AI-powered review summary | L |
| Competitor benchmarking | M |

**Size Key**: S = 1-2 days, M = 3-5 days, L = 5-8 days, XL = 8-13 days

### Recommended Build Order (Risk-First)
1. **Database migration first** — all new tables in one migration, zero risk to existing
2. **EmployerProfile + Badge** — most visible, validates the claim → profile loop
3. **ReviewInvite** — validates the growth loop early
4. **ResponseMetric** — computed from existing data, safe to iterate
5. **WorkplaceReview extension** — extends existing reviews, needs careful testing
6. **Frontend pages** — build after API endpoints are stable
7. **Feed ranking** — last, because it touches existing behavior (must A/B test)

---

## 9. DELIVERY TRACKING

| # | Feature | Status | Owner | Dependency | Risk | Tests |
|---|---|---|---|---|---|---|
| 1 | DB Migration (all new tables) | Not Started | Backend | None | Low | Schema test |
| 2 | EmployerProfile CRUD API | Not Started | Backend | #1 | Low | Unit + Integration |
| 3 | ResponseMetric calculation | Not Started | Backend | #1 | Medium | Unit + data accuracy |
| 4 | Badge evaluation engine | Not Started | Backend | #1, #3 | Medium | Unit + threshold tests |
| 5 | WorkplaceReview extension | Not Started | Backend | #1 | Medium | Backward compat test |
| 6 | SalaryInsight API | Not Started | Backend | #1 | Low | Aggregation tests |
| 7 | ReviewInvite API | Not Started | Backend | #1 | Medium | Token security test |
| 8 | Follow API | Not Started | Backend | #1 | Low | Unit |
| 9 | IssueResolution API | Not Started | Backend | #1 | Low | Flow test |
| 10 | Analytics events API | Not Started | Backend | #1 | Low | Rate limit test |
| 11 | Employer profile page (web) | Not Started | Frontend | #2, #3, #4 | Medium | Visual + responsive |
| 12 | Employer dashboard (web) | Not Started | Frontend | #2, #10 | High | Complex state |
| 13 | Invite generator page (web) | Not Started | Frontend | #7 | Low | Share flow test |
| 14 | Workplace review form (web) | Not Started | Frontend | #5 | Medium | Form validation |
| 15 | Salary tab (web) | Not Started | Frontend | #6 | Low | Chart rendering |
| 16 | Follow button (web) | Not Started | Frontend | #8 | Low | Toggle test |
| 17 | Issue resolved UI (web) | Not Started | Frontend | #9 | Low | Interaction test |
| 18 | Feed ranking enhancement | Not Started | Backend | #3, #8 | High | A/B testing |
| 19 | Search ranking enhancement | Not Started | Backend | #3 | Medium | Relevance testing |
| 20 | Admin employer verification | Not Started | Full Stack | #2 | Low | Workflow test |

---

## 10. TESTING PLAN

### Unit Tests

| Module | Tests |
|---|---|
| EmployerProfileService | Create/update profile, validation, ownership check, profile completion calc |
| ResponseMetricService | recalculateMetrics accuracy, edge cases (0 reviews, all replied) |
| BadgeService | Each badge threshold (award + revoke), permanent vs revocable badges |
| ReviewInviteService | Token generation uniqueness, expiry logic, maxUses enforcement |
| FollowService | Create/delete, max follows limit, duplicate prevention |
| SalaryInsightService | Aggregation with < 3 submissions (should not expose), median calculation |
| IssueResolutionService | State transitions (open → resolved → confirmed, open → resolved → disputed) |
| FeedRankingService | Score calculation, each factor contribution, edge cases |

### Integration Tests

| Test | Coverage |
|---|---|
| Claim → Profile → Verify flow | Full lifecycle from claim to verified badge |
| Review → Reply → Resolve flow | Owner reply triggers metric update, reviewer confirms |
| Invite → Open → Review flow | Token resolution + review creation + conversion tracking |
| Workplace review creation | Standard review + workplace data in single request |
| Salary aggregation accuracy | Insert 5 salaries, verify min/max/median/avg |

### E2E Tests

| Flow | Steps |
|---|---|
| Employer onboarding | Register → create entity → claim → admin approves → create profile → invite |
| Employee review journey | Open invite link → login → submit workplace review with sub-ratings |
| Response loop | Employee writes review → owner gets notified → replies → marks resolved → employee confirms |
| Feed personalization | User follows entity → new review on entity → appears higher in feed |

### Role/Permission Tests

| Test | Expected |
|---|---|
| Non-owner tries to create profile | 403 Forbidden |
| Non-owner tries to create invite | 403 Forbidden |
| Non-owner tries to mark issue resolved | 403 Forbidden |
| Non-author tries to confirm resolution | 403 Forbidden |
| Admin verifies employer | 200 OK + badge awarded |
| User submits salary for banned entity | 404 |

### Security Tests

| Test | Vector |
|---|---|
| Invite token enumeration | Attempt sequential tokens → should fail |
| XSS in profile description | Submit `<script>` → should be sanitized |
| IDOR on employer dashboard | Access other entity's analytics → 403 |
| Rate limiting on analytics events | 100 events/min from one IP → throttled after 10 |
| Salary PII leakage | Query with 1-2 submissions → should return empty |

### Abuse Tests

| Test | Scenario |
|---|---|
| Fake claim prevention | Same user claims 50 entities → should be rate-limited |
| Invite spam | Generate 100 invites → blocked at 20 |
| Self-review via invite | Owner uses own invite to review own entity → blocked |
| Salary manipulation | One user submits 10 salaries for same role → blocked (unique constraint) |

---

## 11. SECURITY CHECKLIST

| Area | Status | Implementation |
|---|---|---|
| JWT | Existing | Short-lived access token (15min), refresh token rotation |
| Refresh token | Existing | Stored as hash, rotated on each refresh, revoked on logout |
| Cookies | Existing | HttpOnly, Secure, SameSite=Strict for refresh token |
| CSRF | Existing | SameSite cookie + custom header check |
| Rate limiting | Existing + Extend | Add: 10 analytics events/min/IP, 5 invites/hour/user, 3 salary submissions/day |
| XSS prevention | Existing | `sanitizeInput()` strips HTML. Profile URLs validated against allowlist schemes |
| SQL injection | Existing | Prisma parameterized queries only |
| Invite token security | New | 32-byte crypto random, non-sequential, one-way lookup only |
| Claim fraud prevention | Existing + Extend | One claim/entity/user, pending auto-expire 30d, admin-only approval |
| PII protection (anonymous) | New | Anonymous salary submissions: never expose individual rows. Anonymous reviews: author ID stripped in API response |
| Replay prevention | Existing | Nonce in OTP flow, token rotation prevents replay |
| Moderation logging | Existing | All admin/moderation actions in AuditLog with actor ID, timestamp, IP hash |
| URL validation | New | Profile URLs must be https:// only. No javascript:, data:, or file: URIs |
| File upload (logo/cover) | New | Validate MIME type, max size 2MB, served from CDN (not direct DB) |
| Domain verification | Phase 2 | Send verification email to admin@domain.com, one-time code, 24h expiry |

---

## 12. MVP RECOMMENDATION

### The Minimum Viable Employer Loop

Build exactly this slice first:

```
1. EmployerProfile (description, logo, benefits, size, industry)
2. Response Metrics (auto-calculated from existing replies)
3. Review Invite Links (create, share, track)
4. Follow Entity (simple toggle)
5. 2 Entity Badges: verified_employer + fast_responder
6. Employer Dashboard: stats cards + unanswered reviews + invite manager
7. Employer Public Profile Page: cover + info + badges + metrics
```

**Why this slice works**:

| Goal | How This Achieves It |
|---|---|
| **Employer participation** | Profile + dashboard give them visibility and control |
| **Employee trust** | Verified badge + response metrics = transparent accountability |
| **Review growth** | Invite links = viral loop, each link brings new reviewer |
| **Product differentiation** | Response score system doesn't exist on Google Reviews / Glassdoor PK |

**What to defer**:
- Workplace sub-ratings → standard reviews work fine for MVP
- Salary transparency → requires volume to be useful
- Feed ranking changes → too risky to change existing behavior in MVP
- Gamification badges → nice-to-have, not growth-critical

**Estimated MVP timeline**: 4 sprints (2 backend, 2 frontend) — assuming 1 full-stack engineer.

### The Growth Sequence After MVP

```
MVP Launch
  → Employers claim and build profiles
  → Send invite links to employees/customers
  → Reviews flow in
  → Response metrics populate naturally
  → Add workplace review fields (Phase 2)
  → Add salary transparency (Phase 2)
  → Add enhanced ranking (Phase 2)
  → Add gamification (Phase 2)
```

Each phase builds on real user data from the previous phase. No feature is built in a vacuum.
