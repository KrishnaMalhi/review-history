# Fake Reviews and Trust Defense Documentation

## 1. Core Problem

A review platform lives or dies on trust.  
The two main failure modes are:

1. fake positive inflation
2. fake negative attacks

## 2. Real Abuse Scenarios

### Scenario A
Landlord or business creates multiple accounts and leaves fake 5-star reviews.

### Scenario B
Competitor or enemy creates multiple fake negative reviews.

### Scenario C
An angry former tenant/customer posts exaggerated or fabricated claims.

### Scenario D
Someone pays people to post reviews at scale.

## 3. Defense Philosophy

There is no single silver bullet.  
The platform needs a layered defense model.

## 4. Layer 1 — Identity Friction

Recommended MVP:
- Pakistani phone OTP required,
- one account per verified phone number,
- one active review per entity per account.

Why it helps:
- raises the cost of mass fake account creation,
- enables traceable account integrity,
- makes abuse waves easier to detect.

Important note:
Phone verification increases friction but does not prove truth. It is a trust control, not a truth guarantee.

## 5. Layer 2 — Submission Rules

Rules:
- new accounts may face cooldown before reviewing,
- limit review velocity,
- block duplicate review attempts,
- require minimum quality thresholds,
- prefer structured category forms.

This reduces drive-by abuse.

## 6. Layer 3 — Community Signals

Each review can gather:
- helpful votes,
- same-experience signals,
- seems-fake signals,
- reports.

Use these carefully:
- do not fully crowd-govern legal-sensitive cases,
- do use them to prioritize moderation,
- do use them to suppress suspicious ranking boosts.

## 7. Layer 4 — Automated Detection

Flag conditions:
- burst reviews in a short window,
- cluster from same IP/device/area pattern,
- new-account immediate review,
- copy-paste text,
- unnatural rating uniformity,
- single-purpose accounts reviewing one target only,
- abnormal same-day signup cluster,
- cross-entity coordinated behavior.

Possible outcomes:
- publish with label,
- reduce ranking weight,
- hold for moderation,
- remove if clearly manipulative.

## 8. Layer 5 — Owner Right of Reply

This is critical for fairness and for platform credibility.

The reviewed party can:
- state that they believe the review is inaccurate,
- clarify context,
- provide their side publicly.

This gives users context without handing the owner deletion power.

## 9. Layer 6 — Moderation and Appeals

Human review is required for:
- dangerous accusations,
- identity mismatch disputes,
- claim disputes,
- repeated coordinated attacks,
- legal complaints.

## 10. Review Status Design

Recommended statuses:
- published
- under verification
- limited visibility
- removed
- appealed

“Under verification” is often better than silent removal.

## 11. Duplicate Entity Protection

Fake-review defense fails if the same subject can be split across many near-duplicate profiles.

Therefore:
- detect duplicates on creation,
- encourage use of existing entries,
- merge duplicates quickly,
- preserve aliases.

## 12. Trust Score and Fake Reviews

The trust score must discount suspicious activity.

Examples:
- 10 five-star reviews in one day from fresh accounts should not dramatically boost score.
- 1 negative review with strong detail and useful votes may deserve more ranking weight than 5 empty suspicious positives.

## 13. Reviewer Quality Signals

Useful internal signals:
- account age,
- account diversity of contributions,
- verified phone present,
- review length and structure,
- edit behavior,
- helpful vote ratio,
- moderation history.

## 14. Why This Works

This model works because it combines:
- friction,
- transparency,
- detection,
- community input,
- owner participation,
- moderation.

It does not rely on blind censorship or blind trust.

## 15. MVP Recommendation

For MVP, prioritize:
1. phone OTP
2. one review per entity
3. burst detection
4. report flow
5. owner replies
6. moderation queue
7. duplicate controls

Do not overcomplicate with full ML at first.

## 16. Product Principle

A trusted review platform should not promise:
- “all reviews are true”

It should promise:
- “we work actively to reduce abuse, show context, and maintain fair review integrity.”
