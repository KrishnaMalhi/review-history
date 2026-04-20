# 17 - Canonical Flow Spec (v1)

This is the consolidated flow spec for `review-history` based on the current doc set.

## 1. Core Loops

1. Identity loop (OTP -> session -> anti-abuse profile)
2. Entity loop (search -> create -> duplicate control -> claim/merge lifecycle)
3. Review loop (eligibility -> submit -> risk/moderation states -> votes/replies)
4. Trust loop (recompute aggregates -> trust score -> ranking)
5. Moderation loop (flags -> case triage -> action -> audit -> appeal)

## 2. End-to-End User Flow

1. Guest searches entities by text + category + city/locality.
2. Guest opens entity profile and reviews.
3. If entity missing, user adds entity with fingerprint fields.
4. Auth is required for write actions via phone OTP.
5. User submits one review per entity (per account), with tags and policy checks.
6. Review is published or marked under verification or queued.
7. Community votes/reports feed moderation and trust weighting.
8. Owner may claim profile and reply publicly.
9. Moderation handles high-risk or policy-sensitive cases with audit logs.
10. Trust score and search ranking update asynchronously after material events.

## 3. Canonical States

### Reviews
- `draft`
- `submitted`
- `published`
- `under_verification`
- `hidden`
- `removed`
- `archived`

### Entities
- `active`
- `claimed`
- `possible_duplicate`
- `merged`
- `suspended`
- `archived`

### Claims
- `pending`
- `approved`
- `rejected`
- `revoked`

### Reports
- `open`
- `triaged`
- `resolved`
- `appealed`
- `closed`

## 4. Non-Negotiable Product Rules

1. Entity-first listing model; entities can exist without owner accounts.
2. Claimed owners can reply but cannot silently delete valid reviews.
3. One account per verified phone and one active review per entity per account.
4. Duplicate handling must preserve aliases and audit trail after merge.
5. Trust output must be explainable and must not represent legal fact.

## 5. Canonical API Semantics (v1)

- Pagination keys: `page`, `pageSize`
- Search keys: `q`, `categoryKey`, `cityId`, `localityId`, `sort`, `minRating`
- Compatibility aliases accepted: `limit`, `category`, `city`

## 6. Event Triggers (minimum)

- `user.verified`
- `entity.created`
- `review.submitted`
- `review.published`
- `review.flagged`
- `entity.claim_approved`
- `vote.recorded`
- `entity.merged`
- `trust.recomputed`

## 7. Launch Behavior

1. Prefer `under_verification` to hard deletion for ambiguous content.
2. Use human moderation for legal-sensitive content.
3. Keep scoring simple and observable in MVP.
