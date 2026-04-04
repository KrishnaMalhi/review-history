# Categories, Entity Model, and Trust Score Design

## 1. Entity-First Data Model

The core unit of the platform is an **entity**, not a business account.

An entity can be:
- a person,
- a property,
- a clinic,
- a business,
- a shop,
- a service provider,
- a company,
- a building,
- a team/agency,
- or another reviewable real-world subject.

## 2. Recommended MVP Categories

## 2.1 Landlords
Examples:
- individual landlords,
- property owners,
- apartment managers.

Important fields:
- full name or common name,
- city,
- area,
- property/building reference,
- optional phone,
- optional address/landmark.

## 2.2 Rentals / Apartments / Buildings
Examples:
- apartment buildings,
- hostels,
- houses for rent,
- office spaces.

Important fields:
- property name,
- building name,
- street/block,
- area,
- city,
- type of property.

## 2.3 Doctors / Clinics
Examples:
- doctors,
- dentists,
- physiotherapists,
- skin clinics,
- dental clinics.

Important fields:
- doctor or clinic name,
- specialty,
- clinic name,
- area,
- city,
- optional phone.

## 2.4 Local Services
Examples:
- mechanics,
- electricians,
- plumbers,
- AC technicians,
- tutors,
- contractors.

Important fields:
- name,
- category,
- city,
- area,
- optional workshop/shop name,
- optional phone.

## 2.5 Businesses
Examples:
- stores,
- restaurants,
- agencies,
- salons,
- service companies.

Important fields:
- business name,
- category,
- branch location,
- city,
- area,
- optional phone.

## 3. Entity Fingerprint

Because many people share the same name, a platform must separate entities using a location and context fingerprint.

## 3.1 Fingerprint fields
Use a weighted combination of:
- display name,
- category,
- city,
- area/neighborhood,
- address or landmark,
- branch/building/property name,
- optional phone number,
- optional website/social links,
- optional CNIC/business registration data only if later introduced lawfully.

## 3.2 Fingerprint example
- Dr. Ahmed + Doctor + Johar Town + Lahore + Al-Shifa Clinic
- Dr. Ahmed + Doctor + DHA Phase 3 + Lahore + LifeCare Clinic

These are different entities.

## 4. Entity States

- `draft`
- `active`
- `claimed`
- `under_review`
- `merged`
- `suspended`
- `archived`

## 5. Duplicate Handling

## 5.1 On create
When a user tries to add an entity:
- normalize name,
- normalize phone,
- normalize area/city,
- compare similar names,
- compare same-location patterns,
- show possible matches before creating.

## 5.2 After create
Allow:
- “This looks like the same person/business”
- duplicate reports,
- community confirmations,
- moderator merge.

## 5.3 Merge rules
When merged:
- one canonical entity survives,
- aliases are preserved,
- reviews move to canonical entity,
- redirects remain for old URLs,
- audit log is mandatory.

## 6. Category-Specific Review Dimensions

## Landlords / Rentals
- honesty
- deposit return
- maintenance responsiveness
- hidden charges
- safety
- communication

## Doctors / Clinics
- professionalism
- wait time
- communication
- fee fairness
- staff behavior
- clinic cleanliness

## Local Services
- punctuality
- quality of work
- price fairness
- honesty
- communication
- after-service support

## Businesses
- value for money
- customer service
- delivery/timeliness
- quality consistency
- complaint handling

## 7. Trust Score Model

Trust Score should not just mirror star rating.  
It should summarize overall confidence in dealing with the entity.

Recommended range: `0 to 100`

## 7.1 Inputs to trust score
- average rating,
- number of reviews,
- recency of reviews,
- verified review ratio,
- review helpfulness ratio,
- review dispute ratio,
- policy violation ratio,
- response behavior,
- unresolved complaint patterns,
- duplicate/abuse suspicion.

## 7.2 Example weighting
- 30% average rating and rating stability
- 20% review count confidence
- 15% recency and consistency
- 10% helpful vote quality
- 10% verified/credible reviewer signals
- 10% moderation cleanliness
- 5% owner responsiveness

## 7.3 Confidence floor
A brand-new entity should never look “trusted” just because one person gave 5 stars.  
Add a confidence dampener:
- low review count,
- very new entity,
- suspiciously uniform ratings.

## 7.4 Example labels
- 0–24: High Risk
- 25–44: Caution
- 45–64: Mixed
- 65–79: Good
- 80–100: Strong

## 8. Trust Score Display Rules

Never display only one number. Show:
- trust score,
- star rating,
- review count,
- top warnings,
- top positives,
- data confidence indicator.

Example:
- Trust Score: 23/100
- Rating: 1.4/5 from 12 reviews
- Confidence: Moderate
- Common issues: deposit retention, rude behavior, hidden charges

## 9. Review Quality Score

Each review should also have an internal quality score for ranking:
- length quality,
- structured inputs completed,
- account age,
- similarity to other reviews,
- community helpful votes,
- moderation flags,
- edit history.

## 10. Entity Claiming

Claiming means:
- the owner or representative verifies control,
- gains reply and profile-management rights,
- does not get deletion power over valid reviews.

Claim rights:
- reply publicly,
- update limited business info,
- upload proof,
- flag policy-violating reviews,
- request duplicate merge.

No claim rights:
- delete valid reviews,
- suppress ratings,
- rewrite historical content.

## 11. Trust Principles

- Trust score must be explainable.
- Low-volume profiles should carry uncertainty.
- Moderation actions must affect score carefully.
- “Under verification” is better than silent deletion.
- Replies should improve transparency, not erase accountability.
