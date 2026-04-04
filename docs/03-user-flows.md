# User Flows

## 1. Reviewer Flow — Search to Review

1. User opens app/web.
2. Searches entity by:
   - name,
   - category,
   - city,
   - area,
   - property/business/clinic name.
3. System returns:
   - exact matches,
   - possible matches,
   - duplicate warnings.
4. User selects correct entity.
5. User taps “Add Review”.
6. If not signed in:
   - sign up/login with Pakistani phone OTP.
7. System checks:
   - one review per entity rule,
   - cooldown rules,
   - account maturity,
   - abuse risk.
8. User fills structured review:
   - star rating,
   - category-specific sub-ratings,
   - title,
   - experience text,
   - issue tags,
   - optional proof metadata if enabled later.
9. User sees content warning:
   - write your experience,
   - do not post threats,
   - do not post private information,
   - do not make unsupported criminal accusations.
10. Review is submitted.
11. System status:
   - published,
   - under verification,
   - queued for moderation.

## 2. Reviewer Flow — Add New Entity

1. Search returns no good result.
2. User taps “Add this person/business/property”.
3. User selects category.
4. User fills minimum fingerprint data:
   - name,
   - city,
   - area,
   - category,
   - address/landmark,
   - optional phone.
5. System checks for duplicates in real time.
6. If likely duplicate:
   - show existing candidates,
   - encourage selection instead of creating new.
7. If unique enough:
   - create entity,
   - redirect user to first review flow.

## 3. User Flow — Helpful / Fake Voting

1. Reader sees a review.
2. Can vote:
   - helpful,
   - same experience,
   - seems fake,
   - report review.
3. System records vote with anti-abuse limits.
4. Excess suspicious votes can:
   - lower review visibility,
   - queue for moderation,
   - label as under verification.

## 4. Claimed Entity Flow

1. Owner finds profile.
2. Clicks “Claim this profile”.
3. Provides verification:
   - phone OTP,
   - supporting documents if category requires,
   - optional business email/domain later.
4. Moderator/system verifies.
5. Entity becomes claimed.
6. Owner gains:
   - reply rights,
   - profile enrichment,
   - analytics,
   - notification tools.
7. Owner cannot delete valid reviews.

## 5. Owner Reply Flow

1. Owner receives review notification.
2. Opens review dashboard.
3. Writes public response.
4. Response is checked for policy violations.
5. Published below review with timestamp.

Best practice:
- acknowledge,
- clarify,
- invite resolution offline when suitable,
- avoid threats.

## 6. Report / Moderation Flow

1. Any signed-in user reports:
   - abusive content,
   - fake review,
   - private information,
   - wrong entity,
   - duplicate entity,
   - dangerous accusation.
2. System assigns severity.
3. High-risk content can be temporarily hidden.
4. Moderator reviews:
   - keep,
   - label,
   - edit-redact private data,
   - remove,
   - suspend user,
   - merge entity.
5. Audit log is stored.

## 7. Duplicate Merge Flow

1. User reports duplicate.
2. System compares fingerprints.
3. If score is high enough:
   - suggest moderator merge,
   - or community-confirm merge if product chooses.
4. Canonical entity chosen.
5. Reviews and aliases are merged.
6. Old URL redirects to new profile.

## 8. Discovery Flow

1. User searches by area and category.
2. Results ranked by:
   - relevance,
   - trust score,
   - review confidence,
   - recency.
3. User filters:
   - city,
   - area,
   - category,
   - claimed/unclaimed,
   - rating range,
   - most reviewed.
4. User opens entity page and reads summaries first.

## 9. MVP Admin Flow

Admin needs minimum panels for:
- user moderation,
- review queue,
- entity queue,
- duplicate queue,
- claim requests,
- legal requests,
- audit events,
- trust-score exceptions.

## 10. Notifications Flow

Recommended notifications:
- review submitted
- review flagged
- claim request approved/rejected
- owner reply received
- entity merged
- moderation action taken
- trust score changed materially

## 11. Guest-to-User Conversion Flow

Guest can:
- search,
- read public profiles,
- filter entities,
- share entity pages.

Guest cannot:
- review,
- vote,
- report,
- claim.

Conversion moment:
- add review,
- vote helpful/fake,
- report content,
- save/watch entity.
