# System Overview and Product Principles

## 1. Vision

Build a trusted review platform where people can evaluate:

- landlords,
- rentals,
- doctors,
- mechanics,
- tutors,
- property dealers,
- businesses,
- service providers,
- and eventually organizations and public-facing professionals.

The platform must solve a difficult market problem:

- the reviewed party often does **not** have an account,
- the reviewed party may want reviews removed,
- bad actors may attempt fake positive or fake negative campaigns,
- users need enough context to safely identify the correct entity.

## 2. Product Thesis

The winning model is **entity-first**, similar to platforms such as directory/review systems where a listing can exist before an owner claims it.

### Wrong model
A business creates an account, then gets reviews.

### Right model
An entity can exist **without** an account.  
Users review the entity.  
The entity may later claim the profile and respond.

This design is necessary because bad actors and low-quality actors usually do not voluntarily register.

## 3. Who This Platform Serves

### Primary user groups
- tenants checking landlords and rentals,
- patients checking clinics/doctors,
- customers checking local service providers,
- employees or contractors checking agencies and firms,
- citizens checking reputation signals before engagement.

### Secondary user groups
- honest businesses that want public trust,
- property managers,
- clinics,
- small businesses,
- service aggregators,
- advertisers targeting high-intent local users.

## 4. Product Value Proposition

### For users
- Avoid bad experiences before money, time, or safety is at risk.
- Search by person, place, business, or category.
- Read concise warnings, patterns, and trend signals.
- Contribute experience in a structured way.

### For claimed entities
- See public feedback.
- Respond publicly.
- Improve reputation through transparency.
- Access reputation tools and analytics.

### For the platform
- Strong trust moat.
- High repeat search intent.
- Strong local SEO and social sharing.
- Monetization through subscriptions, claims, promoted profiles, and B2B tools.

## 5. Non-Negotiable Product Principles

## 5.1 Reviews belong to the public record of experience
A claimed entity cannot silently delete or rewrite user history.

## 5.2 Users review experiences, not identities
Reviews should focus on:
- service,
- pricing,
- behavior,
- communication,
- timeliness,
- professionalism,
- fairness,
- safety,
- cleanliness,
- refund/deposit behavior.

Reviews should not encourage:
- hate speech,
- doxxing,
- criminal accusations without process,
- sensitive personal disclosure,
- harassment.

## 5.3 Trust must be layered
No single anti-fake control is enough. The system needs:
- identity friction,
- per-entity limits,
- duplicate detection,
- review heuristics,
- community feedback,
- moderation,
- owner reply rights,
- appeals.

## 5.4 MVP should be narrow
Do not launch every category at once.
Recommended MVP:
- Landlords
- Rentals/apartments
- Doctors/clinics
- Local services (mechanics/electricians/plumbers)

## 6. Success Criteria

### MVP success
- Users can search or add entities easily.
- Reviews are structured and understandable.
- Obvious fake review attacks are limited.
- Duplicate entities are manageable.
- Claimed entities can reply.
- Moderation and appeals workflows work with a very small team.

### Post-MVP success
- Trust score becomes meaningful.
- Category-specific templates increase content quality.
- SEO pages rank.
- Claimed profiles convert to paid plans.
- Repeat usage and referral traffic grow.

## 7. Platform Boundaries

The platform should not act as:
- a court,
- a police replacement,
- a medical regulator,
- a legal arbitrator.

The platform’s role is to:
- host user opinion and experience,
- moderate rule-breaking content,
- present context,
- allow public response,
- reduce abuse,
- increase transparency.

## 8. Core Objects in the System

- User
- Phone verification
- Entity
- Entity category
- Entity location fingerprint
- Review
- Rating dimension
- Trust score
- Helpful/fake votes
- Entity claim
- Public reply
- Moderation report
- Duplicate merge suggestion
- Audit event

## 9. High-Level Platform Loop

1. User searches.
2. User finds or adds entity.
3. User writes structured review.
4. Review goes through automated checks.
5. Community interacts with review.
6. Entity may claim profile and reply.
7. Trust score updates over time.
8. Search ranking and reputation visibility improve.

## 10. Recommended Launch Positioning

A practical brand promise:
> Search before you trust.

A practical message:
> Read real experiences about landlords, clinics, professionals, rentals, and businesses in your area.

A practical trust promise:
> Profiles can be claimed and replied to, but reviews cannot be silently erased.
