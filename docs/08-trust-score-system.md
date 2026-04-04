# ReviewHistory — Trust Score System

The Trust Score is a single number (0–100) that summarises how trustworthy an entity is based on community reviews. It is the most important signal on any entity page.

---

## 🎯 Trust Score Levels

| Score Range | Level | Colour | Urdu Label | Meaning |
|-------------|-------|--------|------------|---------|
| 0 – 30 | DANGER | 🔴 Red | خطرناک | Strong evidence of bad behaviour |
| 31 – 60 | CAUTION | 🟡 Yellow | محتاط رہیں | Mixed reviews, proceed carefully |
| 61 – 80 | GOOD | 🟢 Green | اچھا | Generally positive experiences |
| 81 – 100 | EXCELLENT | ✅ Dark Green | بہترین | Highly trusted by community |

---

## 🧮 The Algorithm

The trust score is calculated in the `packages/utils/src/trust-score.ts` file. It runs every time a review is added, edited, removed, or voted on.

### Complete TypeScript Implementation

```typescript
import { Review, ReviewStatus } from '@reviewhistory/types';

interface TrustScoreInput {
  reviews: Review[];
  entityCreatedAt: Date;
}

interface TrustScoreResult {
  score: number;           // 0-100
  level: 'DANGER' | 'CAUTION' | 'GOOD' | 'EXCELLENT';
  totalReviews: number;
  publishedReviews: number;
  avgRating: number;
}

export function calculateTrustScore(input: TrustScoreInput): TrustScoreResult {
  const { reviews } = input;

  // ── STEP 1: Filter to published reviews only ─────────────────────────────
  const publishedReviews = reviews.filter(r => r.status === ReviewStatus.PUBLISHED);
  const totalReviews = publishedReviews.length;

  if (totalReviews === 0) {
    return {
      score: 50,           // Default: no data = neutral
      level: 'CAUTION',
      totalReviews: 0,
      publishedReviews: 0,
      avgRating: 0,
    };
  }

  // ── STEP 2: Calculate base score from average rating ─────────────────────
  // Rating scale: 1–5 stars → normalised to 0–100
  // 1 star  = 0
  // 2 stars = 25
  // 3 stars = 50
  // 4 stars = 75
  // 5 stars = 100
  const avgRating = publishedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const baseScore = ((avgRating - 1) / 4) * 100;  // Maps 1-5 to 0-100

  // ── STEP 3: Volume boost ──────────────────────────────────────────────────
  // More reviews = higher confidence → modest boost (max +10 points)
  // log10(10) = 1, log10(100) = 2, log10(1000) = 3
  const volumeBoost = Math.min(10, Math.log10(totalReviews + 1) * 5);

  // ── STEP 4: Fake penalty ─────────────────────────────────────────────────
  // Subtract points if many reviews have been voted as fake
  // Each review with >50% fake votes gets a penalty
  const fakePenalty = publishedReviews.reduce((penalty, review) => {
    const totalVotes = review.helpfulCount + review.fakeCount;
    if (totalVotes >= 5) {
      const fakeRatio = review.fakeCount / totalVotes;
      if (fakeRatio > 0.5) {
        penalty += 5;  // -5 points per suspected fake review
      }
    }
    return penalty;
  }, 0);

  // ── STEP 5: Recency factor ───────────────────────────────────────────────
  // Reviews from last 6 months count 100%, older reviews count 70%
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const recentReviews = publishedReviews.filter(r => new Date(r.createdAt) > sixMonthsAgo);
  const oldReviews = publishedReviews.filter(r => new Date(r.createdAt) <= sixMonthsAgo);

  let recencyAdjustedScore = baseScore;
  if (recentReviews.length > 0 && oldReviews.length > 0) {
    const recentAvg = recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length;
    const oldAvg = oldReviews.reduce((s, r) => s + r.rating, 0) / oldReviews.length;
    const recentScore = ((recentAvg - 1) / 4) * 100;
    const oldScore = ((oldAvg - 1) / 4) * 100;
    // Weight: recent = 70%, old = 30%
    recencyAdjustedScore = (recentScore * 0.7) + (oldScore * 0.3);
  }

  // ── STEP 6: Final calculation ────────────────────────────────────────────
  const rawScore = recencyAdjustedScore + volumeBoost - fakePenalty;
  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  return {
    score: finalScore,
    level: scoreToLevel(finalScore),
    totalReviews,
    publishedReviews: publishedReviews.length,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

function scoreToLevel(score: number): 'DANGER' | 'CAUTION' | 'GOOD' | 'EXCELLENT' {
  if (score <= 30) return 'DANGER';
  if (score <= 60) return 'CAUTION';
  if (score <= 80) return 'GOOD';
  return 'EXCELLENT';
}
```

---

## 📊 Example Scenarios

| Scenario | Reviews | Avg Rating | Fake Votes | Trust Score | Level |
|----------|---------|------------|------------|-------------|-------|
| New entity, no reviews | 0 | — | — | 50 | 🟡 CAUTION |
| 5 reviews, all 5 stars | 5 | 5.0 | 0 | 92 | ✅ EXCELLENT |
| 20 reviews, avg 2.1 stars | 20 | 2.1 | 2 | 29 | 🔴 DANGER |
| 50 reviews, avg 3.8 stars | 50 | 3.8 | 1 | 71 | 🟢 GOOD |
| 10 reviews, avg 4.5, 3 suspected fake | 10 | 4.5 | 3 | 74 | 🟢 GOOD |

---

## 🔄 When Score Recalculates

The trust score is recalculated automatically whenever:

1. A new review is published (status = PUBLISHED)
2. A review is removed or status changes to REMOVED/FLAGGED
3. A vote is cast (helpful or fake) on any review
4. Two entities are merged (all reviews combined and recalculated)
5. Admin manually triggers recalculation

**Implementation:** After any of the above events, the API calls `calculateTrustScore()` and updates `Entity.trustScore`, `Entity.avgRating`, and `Entity.totalReviews` in a single Prisma transaction.

---

## 🛡️ Manipulation Prevention

| Attack | How Score Resists It |
|--------|----------------------|
| Spam 5-star reviews from new accounts | New accounts < 24h get `PENDING` status — not counted in score |
| Multiple reviews from same IP | 3+ reviews same IP → FLAGGED → not counted |
| Coordinated fake voting | `fakePenalty` only triggers after 5+ votes AND >50% fake ratio |
| One-time negative review bombing | Volume boost rewards consistent history; single spikes diluted |
| Entity owner buying fake reviews | Phone OTP: one SIM = one account; limits fake account creation |

---

## 📱 Trust Score UI Display

```
┌─────────────────────────────────────────────────┐
│  Dr. Ahmed                                       │
│  Johar Town, Lahore                              │
│                                                  │
│  ⭐ 2.4/5     🔴 Trust Score: 28                 │
│               ████░░░░░░░░░░░░░░  DANGER         │
│                                                  │
│  ⚠️ 12 people reported issues with this entity  │
└─────────────────────────────────────────────────┘
```

The trust score bar fills proportionally and colours are applied based on the level thresholds defined above.

---

## 🌐 Trust Level Labels (Multilingual)

| Level | English | Urdu | Punjabi |
|-------|---------|------|---------|
| DANGER | Danger | خطرناک | خطرناک |
| CAUTION | Caution | محتاط رہیں | سنبھل کے |
| GOOD | Good | اچھا | چنگا |
| EXCELLENT | Excellent | بہترین | بہت ودھیا |
# 08 — Trust Score System

## 1. Purpose

A star rating is too shallow. The trust score summarizes:
- rating quality
- review volume
- consistency
- warning severity
- recency
- suspicious review penalties
- reply/transparency signals

## 2. Scale

Recommended public scale:
- 0–20: Critical risk
- 21–40: High caution
- 41–60: Mixed / unclear
- 61–80: Generally trusted
- 81–100: Strong trust

## 3. Suggested Formula

```text
Trust Score =
  Base Rating Score
+ Volume Confidence Score
+ Consistency Score
+ Recency Score
+ Responsiveness Score
- Severe Warning Penalty
- Suspicious Activity Penalty
- Moderation Penalty
```

## 4. Example Component Weights

### Base Rating Score (0–40)
Convert weighted average rating to 40-point scale.

### Volume Confidence Score (0–15)
More reviews increase confidence, but cap the effect.

### Consistency Score (0–10)
If reviews tell similar experience patterns over time, confidence rises.

### Recency Score (0–10)
Recent valid reviews matter more.

### Responsiveness Score (0–10)
If claimed entity responds professionally and consistently, add modest points.

### Severe Warning Penalty (0 to -20)
Repeated high-severity tags reduce trust.

### Suspicious Activity Penalty (0 to -15)
Bulk same-window reviews, new-account surges, same network patterns.

### Moderation Penalty (0 to -10)
Applied when many reviews are hidden or under active verification.

## 5. Sample Calculations

### Example A — Unsafe landlord
- rating avg = 1.4/5 -> 11/40
- volume = 12 reviews -> 8/15
- consistency = repeated deposit issues -> 7/10
- recency = recent signals -> 8/10
- responsiveness = no reply -> 0/10
- severe warnings = -9
- suspicious penalty = -2
- moderation penalty = 0

**Total: 23/100**

### Example B — mixed mechanic
- rating avg = 3.6 -> 29/40
- volume = 21 reviews -> 11/15
- consistency = mixed -> 4/10
- recency = 7/10
- responsiveness = 5/10
- warning penalty = -6
- suspicious penalty = -1

**Total: 49/100**

### Example C — trusted clinic
- rating avg = 4.5 -> 36/40
- volume = 35 -> 13/15
- consistency = 8/10
- recency = 8/10
- responsiveness = 7/10
- warning penalty = -3
- suspicious penalty = 0

**Total: 69/100**

## 6. Review Weighting

Not all reviews should count equally.

Factors:
- account age
- prior contribution history
- whether review survived community scrutiny
- text quality
- suspiciousness
- consistency with other evidence

## 7. Recalculation Triggers

- new review created
- review edited
- review hidden/published
- vote spike
- duplicate merge
- claim approval
- reply posted
- category tag weight changes

## 8. UI Presentation

Show:
- overall score
- label
- top warning themes
- trend direction
- “x reviews under verification” when relevant

Do not present the trust score as a statement of legal fact. Present it as a platform-generated confidence/risk indicator.
