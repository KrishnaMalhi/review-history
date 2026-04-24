# 07 — Categories and Warning Tags

## 1. Recommended Initial 10 Categories

1. Landlords / Property Owners
2. Real Estate Agents / Dealers
3. Doctors / Clinics
4. Mechanics / Workshops
5. Tutors / Academies
6. Contractors / Builders
7. Employers / Workplaces
8. Local Businesses / Shops
9. Service Providers (electrician, plumber, AC tech, etc.)
10. Agencies / Consultants / Brokers

## 2. Category Strategy

Start with categories where:
- decision pain is high
- trust asymmetry is strong
- repeat harm patterns exist
- local search matters
- users are motivated to warn others

## 3. Tag Design Principles

- tags must be category-specific
- tags must describe experiences, not criminal accusations
- tags must work in Urdu and English
- tags need severity weights for trust score logic
- tags should remain understandable in small UI chips

## 4. Example Warning Tags

### 4.1 Landlord
- Deposit not returned — `deposit_not_returned` — امانت واپس نہیں کی
- Hidden charges — `hidden_charges` — چھپے ہوئے چارجز
- Rude behavior — `rude_behavior` — بدتمیزی
- Maintenance ignored — `maintenance_ignored` — مرمت نظرانداز
- Sudden eviction pressure — `eviction_pressure` — اچانک خالی کرنے کا دباؤ
- Rent increase issue — `unfair_rent_increase` — غیرمنصفانہ کرایہ اضافہ

### 4.2 Doctors / Clinics
- Long wait time — `long_wait_time` — بہت زیادہ انتظار
- Fee not transparent — `fee_not_transparent` — فیس واضح نہیں
- Poor communication — `poor_communication` — ناقص گفتگو
- Rushed visit — `rushed_visit` — جلدی میں معائنہ
- Follow-up issue — `followup_issue` — فالو اپ مسئلہ

### 4.3 Mechanics
- Overcharged — `overcharged` — زیادہ پیسے لیے
- Problem not fixed — `problem_not_fixed` — مسئلہ حل نہیں ہوا
- Delayed delivery — `delayed_delivery` — تاخیر سے گاڑی دی
- Extra repair added — `unauthorized_repair` — بغیر اجازت مرمت
- Bad parts quality — `poor_parts_quality` — خراب پرزہ معیار

### 4.4 Tutors / Academies
- Poor teaching quality — `poor_teaching_quality` — کمزور پڑھائی
- No punctuality — `not_punctual` — وقت کی پابندی نہیں
- Hidden fee issue — `hidden_fee_issue` — چھپی ہوئی فیس
- Weak communication — `weak_communication` — کمزور رابطہ

### 4.5 Agencies / Brokers
- Misleading promise — `misleading_promise` — گمراہ کن وعدہ
- Slow response — `slow_response` — سست جواب
- Upfront payment pressure — `upfront_payment_pressure` — پہلے ادائیگی کا دباؤ
- Incomplete delivery — `incomplete_delivery` — نامکمل سروس

## 5. Positive Tags

Not every tag should be negative. Add balanced tags:
- fair pricing
- responsive
- professional
- transparent
- honest guidance
- punctual
- cooperative

## 6. Tag Severity Weights

Example:
- low severity: 1
- medium severity: 2
- high severity: 4

High severity tags should still remain experience-based, not defamatory.

## 7. Admin Governance

- tags versioned by category
- deprecated tags remain mapped historically
- trust score engine must support tag evolution
