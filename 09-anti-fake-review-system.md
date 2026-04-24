# 09 — Anti-Fake-Review System

## 1. Threat Model

### Scenario A
Landlord creates multiple fake accounts to boost rating.

### Scenario B
Competitor attacks a rival with fake negatives.

### Scenario C
Angry user posts exaggerated or false spam.

### Scenario D
Paid reviewers manipulate outcomes.

## 2. Defense Philosophy

No single control is enough. Use layered defense.

## 3. Layer 1 — Phone Number Lock

Rule:
- one phone number = one account
- one account = one review per entity

Why it matters:
- raises attack cost
- reduces disposable account volume
- works well for Pakistan-first OTP onboarding

Important note:
Phone verification improves resistance but is not perfect. Treat it as a strong identity friction layer, not proof of truth.

## 4. Layer 2 — Community Voting

Signals:
- helpful
- not helpful
- seems fake

Outcomes:
- review may lose ranking weight
- review may enter moderation
- repeated bad signals reduce account trust

## 5. Layer 3 — Auto Detection

Rules can flag:
- very new account posting instantly
- same IP / network patterns
- device fingerprint clusters
- copy-paste text patterns
- burst reviews in same window
- entity receives unusual positive or negative surge
- single-purpose accounts

Flagged reviews can be:
- published with under-verification badge
- limited in score impact
- queued for human review

## 6. Layer 4 — Owner Right of Reply

Owners can:
- reply publicly
- contest reviews
- flag false content

Owners cannot:
- delete valid reviews
- directly alter score
- suppress tags

## 7. Entity vs User Separation

This is the key design choice.

Wrong model:
- only registered businesses/people can be reviewed

Better model:
- anyone can add an entity
- reviews attach to entities, not claimant accounts

## 8. Duplicate Prevention

Entity fingerprint:
- name
- category
- city
- locality
- optional phone
- optional address / landmark

Flow:
- on create, system searches near-duplicates
- suggest existing entries
- create candidate pairs
- allow community/admin merge

## 9. Proof and Evidence Strategy

MVP:
- do not require hard proof for every review
- allow optional evidence metadata or references
- reserve evidence workflow for disputes/high-risk content

## 10. Suspicious Review States

- clean
- low confidence
- under verification
- hidden pending review
- removed by policy

## 11. Reviewer Reputation Signals

- account age
- number of approved contributions
- helpfulness on prior reviews
- report/violation history
- edit behavior
- deletion frequency

## 12. Abuse Response Playbook

### Low risk
Publish with low score impact.

### Medium risk
Publish under verification.

### High risk
Hold for manual moderation.

### Severe content policy issue
Hide immediately, review case, record audit.

## 13. Why This Works

It combines:
- friction
- community signals
- heuristics
- transparency
- non-owner-controlled review hosting
