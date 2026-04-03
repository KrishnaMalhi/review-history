# ReviewHistory — Anti-Fake Review System

A 4-layer defense system designed specifically for Pakistan's context, where coordinated fake reviews, competitor sabotage, and paid review farms are real threats.

---

## 🚨 The 4 Fake Review Scenarios We Defend Against

| Scenario | Description | Example |
|----------|-------------|---------|
| **Fake Positive** | Business pays for 5-star reviews | Doctor's assistant creates 10 accounts to boost score |
| **Fake Negative** | Competitor posts false bad reviews | Rival mechanic posts fake 1-star reviews to sabotage |
| **Review Bombing** | Coordinated attack from social media | Facebook group targets a business with fake reviews |
| **Ghost Reviews** | Reviews about a different entity | Review for "Dr. Ahmed, DHA" posted on "Dr. Ahmed, Johar Town" |

---

## Layer 1: Phone Number Lock

### ONE SIM = ONE Account

Pakistan's NADRA (National Database and Registration Authority) requires mandatory SIM registration with a valid CNIC (ID card). This means:

- Every Pakistani SIM card is legally tied to a real person
- Prepaid SIMs require CNIC registration
- Maximum 5 SIMs per CNIC nationally (reduced from higher limits)

**ReviewHistory exploits this:**

```
User wants to create account
        │
        ▼
Must enter Pakistani mobile number
        │
        ▼
OTP sent to that number
        │
        ▼
OTP verified → Account created
        │
        ▼
Phone number stored as UNIQUE in database
One phone = One account. FOREVER.
```

**Database constraint:**
```sql
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
```

**Why this works against fake farms:**
- To create 10 fake accounts = need 10 different SIM cards
- Each SIM costs PKR 200–500 + CNIC registration
- Coordinated fake review farms become expensive and traceable

### NADRA Connection (Future Enhancement)

In Year 2, ReviewHistory plans to integrate with NADRA's VERISYS API to:
- Verify that the phone number is actually registered to a CNIC
- Detect if multiple accounts share the same CNIC number
- Flag accounts with recently activated SIMs (< 30 days old)

---

## Layer 2: Community Voting

### Helpful / Fake Voting System

Every published review shows two voting buttons:
- 👍 **Helpful** — I believe this review
- 🚩 **Fake** — This seems fabricated

**Rules:**
- One vote per user per review
- Cannot vote on your own review
- Must be logged in to vote

**Auto-hide trigger:**

```typescript
// In ReviewsService.updateVoteCounts()
async function checkAutoHide(reviewId: string): Promise<void> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { helpfulCount: true, fakeCount: true, status: true }
  });

  if (!review) return;

  const totalVotes = review.helpfulCount + review.fakeCount;

  // Auto-hide if: 10+ votes AND >70% are "fake" votes
  if (totalVotes >= 10 && review.fakeCount / totalVotes > 0.7) {
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'FLAGGED' }
    });
    // Notify admin for manual review
    await notifyAdminOfFlaggedReview(reviewId);
  }
}
```

**Community voting creates a self-policing network:**
- Regulars who know their local businesses spot fake reviews quickly
- Fake reviews written by non-locals often contain inaccuracies locals catch
- High helpful votes boost credibility without platform intervention

---

## Layer 3: Smart Auto-Detection

Six automatic flags are checked the moment a review is submitted:

```typescript
interface AntiFakeCheckResult {
  status: 'PUBLISHED' | 'PENDING' | 'FLAGGED';
  flags: string[];
}

export async function runAntiFakeChecks(
  userId: string,
  entityId: string,
  reviewBody: string,
  ipHash: string,
  userCreatedAt: Date,
): Promise<AntiFakeCheckResult> {
  const flags: string[] = [];

  // ── FLAG 1: New account (< 24 hours old) ─────────────────────────────────
  const accountAgeHours = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60);
  if (accountAgeHours < 24) {
    flags.push('NEW_ACCOUNT');
  }

  // ── FLAG 2: IP cluster — 3+ reviews from same IP in 24 hours ─────────────
  const recentIpReviews = await prisma.review.count({
    where: {
      ipHash,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recentIpReviews >= 3) {
    flags.push('IP_CLUSTER');
  }

  // ── FLAG 3: Review body too short ─────────────────────────────────────────
  if (reviewBody.trim().length < 20) {
    return { status: 'FLAGGED', flags: ['TOO_SHORT'] };  // Hard reject
  }

  // ── FLAG 4: Generic filler text (zero-information review) ─────────────────
  const genericPhrases = [
    'very good', 'nice place', 'good service',
    'بہت اچھا', 'اچھا ہے', 'ٹھیک ہے ٹھیک ہے'
  ];
  const isGeneric = genericPhrases.some(phrase =>
    reviewBody.toLowerCase().includes(phrase) && reviewBody.length < 50
  );
  if (isGeneric) {
    flags.push('GENERIC_TEXT');
  }

  // ── FLAG 5: Same user reviewed 5+ entities in last hour ───────────────────
  const rapidReviewCount = await prisma.review.count({
    where: {
      authorId: userId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (rapidReviewCount >= 5) {
    flags.push('RAPID_REVIEWING');
  }

  // ── FLAG 6: Entity has 5+ reviews from same IP in last week ───────────────
  const entityIpCluster = await prisma.review.count({
    where: {
      entityId,
      ipHash,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  if (entityIpCluster >= 3) {
    flags.push('ENTITY_IP_CLUSTER');
  }

  // ── Decision logic ─────────────────────────────────────────────────────────
  if (flags.includes('NEW_ACCOUNT') || flags.includes('GENERIC_TEXT')) {
    return { status: 'PENDING', flags };
  }
  if (flags.includes('IP_CLUSTER') || flags.includes('RAPID_REVIEWING') ||
      flags.includes('ENTITY_IP_CLUSTER')) {
    return { status: 'FLAGGED', flags };
  }

  return { status: 'PUBLISHED', flags: [] };
}
```

### Flag Summary Table

| Flag | Condition | Action |
|------|-----------|--------|
| `NEW_ACCOUNT` | Account < 24 hours old | Status: PENDING (not visible until approved) |
| `IP_CLUSTER` | 3+ reviews from same IP in 24h | Status: FLAGGED (admin review required) |
| `TOO_SHORT` | Review body < 20 characters | Hard reject (400 error) |
| `GENERIC_TEXT` | Filler text + < 50 chars total | Status: PENDING |
| `RAPID_REVIEWING` | 5+ reviews in last 60 minutes | Status: FLAGGED |
| `ENTITY_IP_CLUSTER` | 3+ reviews for same entity from same IP | Status: FLAGGED |

---

## Layer 4: Owner Right of Reply

The owner of a claimed entity can respond to any review — but **cannot delete it**.

**This is the most important anti-censorship principle of ReviewHistory:**

> A bad actor (dishonest landlord, overcharging doctor) should NEVER have the power to delete a genuine negative review. Their only option is to respond professionally.

**Owner reply rules:**
- One reply per review only
- Reply is permanently attached to the review, visible to all
- Owner cannot edit the review text
- Owner cannot hide the review
- Owner cannot delete the review
- Reply appears below the review with "Owner Response" label

**Why this is better than owner delete:**
- Yelp allows owner flagging but not deletion — community trusts the reviews more
- Fake review from competitor? Owner reply exposes it publicly
- Genuine complaint? Owner reply showing accountability builds MORE trust
- Deleted negative reviews create suspicion — users know something was hidden

---

## The "Entity Without Account" Model

**One of ReviewHistory's core decisions:** Any entity can be added without registering an account.

**Why this is correct:**
- Bad actors (fraudulent landlords, overcharging doctors) will never willingly register on a platform that allows criticism
- Requiring registration would create a massive loophole: bad actors simply don't register, so they can never be reviewed
- The reviewer (the harmed party) provides the proof through their experience

**Example:**
> Khalid (a tenant who was scammed) should be able to add his landlord and leave a warning review — even if that landlord has never heard of ReviewHistory.

**The entity profile is built by the community, not the entity itself.**

---

## The Same Name Problem: Location Fingerprint

**Problem:** There are hundreds of "Dr. Ahmed" in Pakistan. How do we ensure reviews go to the right person?

**Solution:** The Location Fingerprint — a combination of:

```
Name + Category + City + Area = Unique Identity
```

**Examples:**

| Name | Category | City | Area | These are DIFFERENT people |
|------|----------|------|------|---------------------------|
| Dr. Ahmed | DOCTOR | Lahore | Johar Town | ✓ Entity 1 |
| Dr. Ahmed | DOCTOR | Lahore | DHA Phase 5 | ✓ Entity 2 (different person) |
| Dr. Ahmed | DOCTOR | Karachi | Gulshan | ✓ Entity 3 (different city) |

**Slug generation:**
```typescript
function generateSlug(name: string, category: string, city: string, area?: string): string {
  const parts = [name, city, area].filter(Boolean);
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')             // spaces to hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .trim();
  // Result: "dr-ahmed-johar-town-lahore"
}
```

---

## Duplicate Detection and Merging

### Step 1: Detect at Entity Creation

When a user adds a new entity, the system checks for potential duplicates:

```typescript
async function findPotentialDuplicates(
  name: string, category: string, city: string
): Promise<Entity[]> {
  return prisma.$queryRaw`
    SELECT * FROM "Entity"
    WHERE category = ${category}
      AND city ILIKE ${city}
      AND similarity(name, ${name}) > 0.4
    ORDER BY similarity(name, ${name}) DESC
    LIMIT 5
  `;
}
```

### Step 2: Community Flagging

Users can flag any entity as a duplicate using the "Flag Duplicate" button (see [User Flow 6](./06-user-flows.md#flow-6-flag-duplicate-entity)).

### Step 3: Admin Merge

Admin reviews the flag and can merge entities:
- All reviews from source entity moved to target entity
- Source entity marked `isMerged = true`, `mergedIntoId` = target
- Source entity slug redirected (301) to target entity page
- Trust score recalculated for merged entity

---

## Owner Claim Policy

| Rule | Detail |
|------|--------|
| Who can claim | Any verified user with proof of ownership |
| Proof required | Written statement + optional document photo |
| Admin review time | 48 hours SLA |
| Claimed entity benefits | "Verified" badge, reply to reviews |
| Claim denial | If proof is insufficient or contradicted by community |
| One entity = one owner | Only one approved claim per entity at a time |
| Cannot do after claiming | Delete reviews, change review ratings, hide negative reviews |

---

## Summary: Anti-Fake Defense Table

| Defense Layer | Method | Attacks It Prevents |
|---------------|--------|---------------------|
| Layer 1: Phone Lock | 1 SIM = 1 account | Fake account farms |
| Layer 2: Community Voting | Helpful/Fake votes + auto-hide | Subtle fake reviews |
| Layer 3: Auto-Detection | 6 algorithmic flags | Automated bots, IP farms |
| Layer 4: Owner Reply | Right to respond, not delete | Censorship of genuine reviews |

---

## Global Proof: Platforms with Similar Models

| Platform | Approach | Result |
|----------|----------|--------|
| Glassdoor | Email-verified, one review per employer | Trusted by millions for employer reviews |
| Yelp | Phone + email verified | Industry standard for local business reviews |
| Trustpilot | Email verified + business right of reply | $1.4B valuation; trusted in 65 countries |
| Airbnb | Two-way review system, guest+host | Dramatically reduces fraud in rental market |

All major platforms allow reviews of businesses **without requiring the business to register first**. ReviewHistory follows this proven model.
