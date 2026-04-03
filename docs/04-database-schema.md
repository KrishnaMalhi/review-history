# ReviewHistory — Database Schema

## 📊 Entity Relationship Diagram

```
User ────────────────────── Review ──────────────────── Entity
 │    writes (1:many)         │      belongs to (many:1)   │
 │                            │                            │
 │                            ├── ReviewWarningTag         │
 │                            ├── ReviewPhoto              │
 │                            ├── Vote (1 per user)        │
 │                            ├── Report                   │
 │                            └── OwnerReply (1 per review)│
 │                                                         │
 ├──── EntityClaim ─────────────────────────────────────► │
 └──── DuplicateFlag ───────────────────────────────────► │
```

---

## 📋 Enums

```sql
-- User roles
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- Entity categories
CREATE TYPE "Category" AS ENUM (
  'LANDLORD',
  'DOCTOR',
  'MECHANIC',
  'SHOP',
  'PROPERTY_DEALER',
  'PHARMACY',
  'RESTAURANT',
  'SCHOOL',
  'SALON',
  'OTHER'
);

-- Review status
CREATE TYPE "ReviewStatus" AS ENUM (
  'PUBLISHED',   -- Visible to everyone
  'PENDING',     -- New account < 24h old
  'FLAGGED',     -- Suspected fake, hidden pending review
  'REMOVED'      -- Removed by admin / DMCA
);

-- Entity claim status
CREATE TYPE "ClaimStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- Report reason
CREATE TYPE "ReportReason" AS ENUM (
  'FAKE_REVIEW',
  'DEFAMATORY',
  'WRONG_ENTITY',
  'SPAM',
  'OTHER'
);

-- Report status
CREATE TYPE "ReportStatus" AS ENUM (
  'OPEN',
  'RESOLVED',
  'DISMISSED'
);
```

---

## 🗄️ Table 1: User

Stores all registered users (phone OTP verified).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique identifier |
| `phone` | `varchar(20)` | UNIQUE, NOT NULL | Pakistani mobile number (+92...) |
| `displayName` | `varchar(60)` | NULL | User's display name |
| `avatarUrl` | `text` | NULL | Cloudinary URL |
| `bio` | `varchar(300)` | NULL | Short bio |
| `role` | `Role` | NOT NULL, default `'USER'` | USER / ADMIN / MODERATOR |
| `isBanned` | `boolean` | NOT NULL, default `false` | Hard ban flag |
| `banReason` | `text` | NULL | Reason for ban |
| `reviewCount` | `integer` | NOT NULL, default `0` | Denormalised count |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Account creation |
| `updatedAt` | `timestamptz` | NOT NULL | Last profile update |

**Indexes:**
```sql
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
```

---

## 🗄️ Table 2: OtpCode

Temporary table for phone OTP verification codes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `phone` | `varchar(20)` | NOT NULL | Mobile number |
| `code` | `varchar(6)` | NOT NULL | 6-digit OTP |
| `attempts` | `integer` | NOT NULL, default `0` | Failed attempts counter |
| `expiresAt` | `timestamptz` | NOT NULL | OTP expiry (now + 5 min) |
| `used` | `boolean` | NOT NULL, default `false` | Consumed flag |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Creation time |

**Indexes:**
```sql
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");
```

---

## 🗄️ Table 3: Entity

The core table — any person or business that can be reviewed.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `slug` | `varchar(120)` | UNIQUE, NOT NULL | URL-friendly identifier |
| `name` | `varchar(120)` | NOT NULL | Entity name |
| `category` | `Category` | NOT NULL | Category enum |
| `city` | `varchar(80)` | NOT NULL | City name (e.g., Lahore) |
| `area` | `varchar(80)` | NULL | Area/neighbourhood (e.g., Johar Town) |
| `address` | `text` | NULL | Full address |
| `phone` | `varchar(20)` | NULL | Contact number (NOT for landlords) |
| `description` | `text` | NULL | Brief description |
| `photoUrl` | `text` | NULL | Cover photo (Cloudinary) |
| `trustScore` | `float` | NOT NULL, default `50` | 0–100 calculated score |
| `avgRating` | `float` | NOT NULL, default `0` | Average of all ratings |
| `totalReviews` | `integer` | NOT NULL, default `0` | Published review count |
| `isVerified` | `boolean` | NOT NULL, default `false` | Owner has claimed + verified |
| `isMerged` | `boolean` | NOT NULL, default `false` | Merged into another entity |
| `mergedIntoId` | `uuid` | FK → Entity.id, NULL | Target entity if merged |
| `addedByUserId` | `uuid` | FK → User.id, NULL | Who added this entity |
| `searchVector` | `tsvector` | NULL | Full-text search vector |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Creation time |
| `updatedAt` | `timestamptz` | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");
CREATE INDEX "Entity_category_city_idx" ON "Entity"("category", "city");
CREATE INDEX "Entity_trustScore_idx" ON "Entity"("trustScore" DESC);
CREATE INDEX "Entity_searchVector_idx" ON "Entity" USING GIN("searchVector");
CREATE INDEX "Entity_createdAt_idx" ON "Entity"("createdAt");
```

**Trigger to update searchVector:**
```sql
CREATE TRIGGER entity_search_vector_update
BEFORE INSERT OR UPDATE ON "Entity"
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger("searchVector", 'pg_catalog.english', "name", "city", "area");
```

---

## 🗄️ Table 4: Review

User-submitted review for an entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `entityId` | `uuid` | FK → Entity.id, NOT NULL | Which entity is reviewed |
| `authorId` | `uuid` | FK → User.id, NOT NULL | Who wrote the review |
| `rating` | `integer` | NOT NULL, CHECK (1–5) | Overall star rating |
| `title` | `varchar(120)` | NULL | Optional review title |
| `body` | `text` | NOT NULL | Review text (min 20 chars) |
| `status` | `ReviewStatus` | NOT NULL, default `'PUBLISHED'` | Visibility status |
| `helpfulCount` | `integer` | NOT NULL, default `0` | Helpful vote count |
| `fakeCount` | `integer` | NOT NULL, default `0` | Fake vote count |
| `ipHash` | `varchar(64)` | NOT NULL | HMAC-SHA256 of submitter IP |
| `deviceHash` | `varchar(64)` | NULL | Optional device fingerprint |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Submission time |
| `updatedAt` | `timestamptz` | NOT NULL | Last update |

**Constraints:**
```sql
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check"
  CHECK ("rating" >= 1 AND "rating" <= 5);
ALTER TABLE "Review" ADD CONSTRAINT "Review_author_entity_unique"
  UNIQUE ("authorId", "entityId"); -- one review per user per entity
```

**Indexes:**
```sql
CREATE INDEX "Review_entityId_status_idx" ON "Review"("entityId", "status");
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt" DESC);
CREATE INDEX "Review_ipHash_idx" ON "Review"("ipHash");
```

---

## 🗄️ Table 5: ReviewRating

Stores per-dimension ratings for the review (category-specific).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `reviewId` | `uuid` | FK → Review.id, NOT NULL | Parent review |
| `dimension` | `varchar(60)` | NOT NULL | e.g., "cleanliness", "price_fairness" |
| `score` | `integer` | NOT NULL, CHECK (1–5) | Dimension score |

---

## 🗄️ Table 6: ReviewWarningTag

Links a review to one or more warning tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `reviewId` | `uuid` | FK → Review.id, NOT NULL | Parent review |
| `tag` | `varchar(60)` | NOT NULL | Tag slug (e.g., "deposit_kept") |

**Indexes:**
```sql
CREATE INDEX "ReviewWarningTag_reviewId_idx" ON "ReviewWarningTag"("reviewId");
CREATE INDEX "ReviewWarningTag_tag_idx" ON "ReviewWarningTag"("tag");
```

---

## 🗄️ Table 7: ReviewPhoto

Photos attached to a review.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `reviewId` | `uuid` | FK → Review.id, NOT NULL | Parent review |
| `url` | `text` | NOT NULL | Cloudinary URL |
| `caption` | `varchar(120)` | NULL | Optional caption |
| `uploadedAt` | `timestamptz` | NOT NULL, default `now()` | Upload time |

---

## 🗄️ Table 8: Vote

Helpful/fake votes on reviews — one per user per review.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `reviewId` | `uuid` | FK → Review.id, NOT NULL | Target review |
| `userId` | `uuid` | FK → User.id, NOT NULL | Voter |
| `isHelpful` | `boolean` | NOT NULL | true = helpful, false = fake |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Vote time |

**Constraints:**
```sql
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_review_unique"
  UNIQUE ("userId", "reviewId"); -- one vote per user per review
```

---

## 🗄️ Table 9: Report

User reports on a review.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `reviewId` | `uuid` | FK → Review.id, NOT NULL | Reported review |
| `reportedById` | `uuid` | FK → User.id, NOT NULL | Reporter |
| `reason` | `ReportReason` | NOT NULL | Report category |
| `details` | `text` | NULL | Additional context |
| `status` | `ReportStatus` | NOT NULL, default `'OPEN'` | Admin resolution status |
| `resolvedById` | `uuid` | FK → User.id, NULL | Admin who resolved |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Report time |
| `resolvedAt` | `timestamptz` | NULL | Resolution time |

---

## 🗄️ Table 10: OwnerReply

Owner/business response to a review — one per review maximum.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `reviewId` | `uuid` | FK → Review.id, UNIQUE | One reply per review |
| `authorId` | `uuid` | FK → User.id, NOT NULL | Claim owner |
| `body` | `text` | NOT NULL | Reply text |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Reply time |
| `updatedAt` | `timestamptz` | NOT NULL | Last edit |

---

## 🗄️ Table 11: EntityClaim

Request by a user to claim ownership of an entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `entityId` | `uuid` | FK → Entity.id, NOT NULL | Target entity |
| `claimantId` | `uuid` | FK → User.id, NOT NULL | Person claiming |
| `proofDescription` | `text` | NOT NULL | Written proof |
| `proofPhotoUrl` | `text` | NULL | Document photo |
| `status` | `ClaimStatus` | NOT NULL, default `'PENDING'` | Admin decision |
| `reviewedById` | `uuid` | FK → User.id, NULL | Admin reviewer |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Submission time |
| `reviewedAt` | `timestamptz` | NULL | Decision time |

---

## 🗄️ Table 12: DuplicateFlag

Users flagging an entity as a duplicate of another.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Unique identifier |
| `entityId` | `uuid` | FK → Entity.id, NOT NULL | Entity suspected as duplicate |
| `duplicateOfId` | `uuid` | FK → Entity.id, NOT NULL | Original/target entity |
| `reportedById` | `uuid` | FK → User.id, NOT NULL | Reporter |
| `reason` | `text` | NULL | Explanation |
| `status` | `ReportStatus` | NOT NULL, default `'OPEN'` | Admin decision |
| `createdAt` | `timestamptz` | NOT NULL, default `now()` | Report time |

---

## 📐 Full Prisma Schema (prisma/schema.prisma)

The canonical schema lives in `packages/db/prisma/schema.prisma`. All tables above are implemented as Prisma models with the same column names and types. Migration files are auto-generated via:

```bash
pnpm --filter @reviewhistory/db db:migrate
```

---

## 🔑 Key Query Patterns

```sql
-- Full-text entity search
SELECT * FROM "Entity"
WHERE "searchVector" @@ plainto_tsquery('english', 'Dr Ahmed Johar Town')
ORDER BY ts_rank("searchVector", plainto_tsquery('english', 'Dr Ahmed Johar Town')) DESC;

-- Top entities by category in a city
SELECT * FROM "Entity"
WHERE "category" = 'DOCTOR' AND "city" = 'Lahore'
ORDER BY "trustScore" DESC
LIMIT 20;

-- Reviews for entity (paginated, published only)
SELECT r.*, u."displayName", u."avatarUrl"
FROM "Review" r
JOIN "User" u ON r."authorId" = u.id
WHERE r."entityId" = $1 AND r."status" = 'PUBLISHED'
ORDER BY r."createdAt" DESC
LIMIT 10 OFFSET $2;

-- Suspicious IP cluster detection
SELECT "ipHash", COUNT(*) as review_count
FROM "Review"
WHERE "entityId" = $1
  AND "createdAt" > now() - interval '24 hours'
GROUP BY "ipHash"
HAVING COUNT(*) >= 3;
```
