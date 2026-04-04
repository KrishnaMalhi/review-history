# System Flow and Lifecycle Documentation

## 1. End-to-End Lifecycle

This platform has five major lifecycle loops:

1. **Identity loop**
2. **Entity loop**
3. **Review loop**
4. **Trust loop**
5. **Moderation loop**

These loops interact continuously.

## 2. Identity Loop

### Objective
Ensure users are real enough to contribute responsibly without making contribution impossible.

### Lifecycle
1. Phone number entered.
2. OTP sent.
3. OTP verified.
4. User account created or resumed.
5. Anti-abuse profile initialized:
   - signup time,
   - device/IP metadata,
   - cooldown state,
   - account trust signals.

### Core rules
- one account per verified phone number,
- one review per entity per account,
- optional cooldown before first review,
- stricter review throughput limits for new accounts.

## 3. Entity Loop

### Objective
Make any real-world subject reviewable, even if they never register.

### Lifecycle
1. Search query received.
2. Existing entities searched.
3. If no match, user proposes new entity.
4. Duplicate check runs.
5. Entity created in active state or under-review state.
6. Entity becomes searchable.
7. Entity may later be claimed, merged, suspended, or archived.

## 4. Review Loop

### Objective
Collect useful, opinion-based experience data while resisting abuse.

### Lifecycle
1. User starts review.
2. Eligibility checks run.
3. Structured form submitted.
4. Automatic risk scoring runs.
5. Review enters one of:
   - published,
   - published with warning,
   - hidden pending moderation.
6. Community votes accumulate.
7. Entity replies may be added.
8. Review ranking score evolves over time.
9. Review may be edited, redacted, removed, or appealed.

## 5. Trust Loop

### Objective
Turn raw reviews into stable decision-support signals.

### Lifecycle
1. Review published or updated.
2. Rating aggregates recompute.
3. Trust score inputs update.
4. Entity summary recomputes:
   - overall rating,
   - warnings,
   - category insights,
   - review count,
   - confidence band.
5. Search ranking updates.
6. Trend analytics update.

## 6. Moderation Loop

### Objective
Detect and handle abuse without over-censoring valid experience.

### Lifecycle
1. Flag source:
   - model,
   - rule engine,
   - community,
   - owner report,
   - moderator.
2. Case created.
3. Severity classified:
   - low,
   - medium,
   - high,
   - legal-sensitive.
4. Action decided:
   - keep,
   - label,
   - redact,
   - hide,
   - remove,
   - user sanction,
   - entity merge,
   - escalation.
5. Audit log written.
6. Appeals allowed when applicable.

## 7. System Flow by Core Screen

## 7.1 Search Page
Input:
- text query,
- location filters,
- category filters.

Output:
- matching entities,
- possible duplicate groups,
- “add new entity” CTA.

## 7.2 Entity Page
Input:
- entity id / slug.

Output:
- summary card,
- trust score,
- star rating,
- warnings,
- review list,
- owner response,
- claim CTA,
- report CTA.

## 7.3 Review Submission Page
Input:
- entity context,
- category template,
- user auth state.

Output:
- validated review payload,
- policy warning,
- submission status.

## 7.4 Moderation Dashboard
Input:
- flagged objects.

Output:
- case queue,
- decision interface,
- audit history,
- merge tools,
- sanctions.

## 8. Data State Transitions

## Review states
- draft
- submitted
- published
- under_verification
- hidden
- removed
- archived

## Entity states
- active
- claimed
- possible_duplicate
- merged
- suspended
- archived

## Claim states
- pending
- approved
- rejected
- revoked

## Report states
- open
- triaged
- resolved
- appealed
- closed

## 9. Example Trust Update Sequence

Example:
1. Entity has 3 reviews, rating 4.7, low confidence.
2. Suddenly 8 five-star reviews arrive from new accounts in 2 days.
3. Detection engine flags burst anomaly.
4. Reviews marked under verification.
5. Trust score confidence drops.
6. Search ranking suppresses suspicious boost.
7. Moderator investigates.
8. Final action:
   - keep, label, or remove.

## 10. Event-Driven Design Suggestions

Recommended domain events:
- `user.verified`
- `entity.created`
- `entity.claim_requested`
- `entity.claim_approved`
- `review.submitted`
- `review.published`
- `review.flagged`
- `review.removed`
- `vote.recorded`
- `duplicate.reported`
- `entity.merged`
- `trust.recomputed`

## 11. Analytics Events

Track:
- search performed,
- search no-result rate,
- add-entity started/completed,
- review submit conversion,
- review rejection rate,
- report rate,
- claim conversion,
- reply rate,
- trusted profile CTR,
- share events.

## 12. Launch Recommendations

For MVP:
- prefer human moderation over aggressive auto-removal,
- prefer “under verification” over deletion,
- keep scoring simple and explainable,
- use strong audit logs from day one.
