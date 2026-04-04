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
