# Phase Breakdown Documentation

## 1. Delivery Philosophy

Build in controlled phases.  
Do not start with the hardest possible product shape.

Goal:
- launch trustable basics first,
- add complexity only when behavior justifies it.

## 2. Phase 0 — Product Framing

### Objective
Clarify scope and reduce category sprawl.

### Deliverables
- final MVP categories
- core entity schema
- review policy draft
- trust score v1 formula
- moderation rules v1
- wireframes
- data model

### Exit criteria
- one clear MVP use case
- policy posture defined
- architecture approved

## 3. Phase 1 — Foundation MVP

### Scope
- phone OTP auth
- user accounts
- search entities
- add entity
- add review
- one review per entity rule
- basic entity page
- basic trust display
- report review
- basic admin moderation
- duplicate suggestions on create
- owner claim request
- public replies

### Exclude
- advanced AI moderation
- advanced recommendation feeds
- media-heavy reviews
- mobile apps
- paid subscriptions

### Exit criteria
- end-to-end loop works
- moderation possible
- claim workflow possible
- duplicate pain manageable

## 4. Phase 2 — Trust and Quality Layer

### Scope
- review helpful/fake voting
- under-verification labels
- abuse scoring
- trust score v2
- review quality ranking
- duplicate merge tooling
- claim verification improvements
- analytics events
- improved search filters

### Exit criteria
- fake review resistance improved
- low-quality spam suppressed
- ranking quality acceptable

## 5. Phase 3 — Category Depth

### Scope
- category-specific review forms
- category-specific insights
- issue tags by category
- better entity summaries
- area/city landing pages
- category landing pages
- trend panels

### Exit criteria
- user content is more structured
- search and SEO improve
- comparison quality improves

## 6. Phase 4 — Monetization

### Scope
- claimed profile subscription
- promoted profiles with transparency label
- lead/contact tools
- premium analytics
- team access for businesses
- local ad placements

### Exit criteria
- revenue begins without destroying trust
- monetization does not distort ranking unfairly

## 7. Phase 5 — Platform Expansion

### Scope
- additional categories
- mobile apps
- media uploads
- multilingual support
- business dashboards
- B2B APIs
- market expansion beyond Pakistan

### Exit criteria
- repeatable operations
- stable moderation
- legal process maturity
- scalable infra

## 8. Suggested 16-Week MVP Plan

## Weeks 1–2
- product scope freeze
- schemas
- wireframes
- project setup
- auth base
- design system start

## Weeks 3–4
- OTP auth
- user module
- categories module
- entity create/search
- duplicate pre-check

## Weeks 5–6
- review submission
- review list
- entity page
- report flow
- admin basics

## Weeks 7–8
- trust score v1
- moderation queue
- reply flow
- claim request flow
- notifications basics

## Weeks 9–10
- search ranking improvements
- filters
- audit logs
- rate limits
- abuse rules v1

## Weeks 11–12
- privacy, terms, moderation pages
- SEO pages
- analytics instrumentation
- QA and bug fixing

## Weeks 13–14
- seed data strategy
- launch content
- support tooling
- performance fixes

## Weeks 15–16
- closed beta
- moderation tuning
- duplicate cleanup
- launch readiness review

## 9. Team Plan for Solo Founder / Side Project

If solo:
- cut scope hard,
- web only,
- 3–4 MVP categories max,
- manual moderation,
- no native apps,
- no fancy ML,
- no heavy admin polish.

## 10. Build Sequence Priority

1. auth
2. entities
3. reviews
4. moderation
5. claim + reply
6. trust score
7. discovery
8. monetization

## 11. Common Failure Modes

- too many categories too early
- weak duplicate handling
- no moderation tooling
- trust score too complex too soon
- monetization before trust
- letting claimed profiles control reviews

## 12. Phase Gate Questions

Before leaving each phase, ask:
- Is content quality acceptable?
- Can abuse be handled by current tools?
- Is duplicate creation under control?
- Are honest users getting value?
- Is the platform becoming more trusted, not less?
