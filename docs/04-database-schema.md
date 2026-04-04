# 04 — Database Schema

This document describes the core tables for the MVP and the scale-ready extensions.

## 1. Design Notes

- PostgreSQL as primary source of truth
- UUID primary keys
- timestamps on all major tables
- soft delete only where operationally useful
- separate audit and moderation history tables
- denormalized aggregates for speed

## 2. Core Tables

### 2.1 users
Stores user identity and account status.

Fields:
- id
- phone_e164
- phone_country_code
- is_phone_verified
- display_name
- username_slug
- city_id nullable
- trust_level
- status
- last_login_at
- created_at
- updated_at
- deleted_at nullable

### 2.2 user_devices
Tracks sessions/devices for abuse analysis.

Fields:
- id
- user_id
- device_fingerprint_hash
- first_ip_hash
- last_ip_hash
- user_agent_hash
- first_seen_at
- last_seen_at
- risk_score

### 2.3 sessions
- id
- user_id
- refresh_token_hash
- device_id
- expires_at
- revoked_at nullable
- created_at

### 2.4 categories
- id
- key
- name_en
- name_ur
- is_active
- sort_order

### 2.5 warning_tags
- id
- category_id
- key
- label_en
- label_ur
- severity_weight
- is_active

### 2.6 cities
- id
- name_en
- name_ur
- province
- is_active

### 2.7 localities
- id
- city_id
- name_en
- name_ur
- postal_code nullable
- is_active

### 2.8 entities
Main public objects being reviewed.

Fields:
- id
- category_id
- display_name
- normalized_name
- phone_e164 nullable
- alternate_phones_json nullable
- address_line nullable
- landmark nullable
- city_id
- locality_id nullable
- latitude nullable
- longitude nullable
- entity_fingerprint
- status
- is_claimed
- claimed_user_id nullable
- average_rating
- rating_count
- review_count
- trust_score
- suspicious_review_count
- hidden_review_count
- last_reviewed_at nullable
- created_by_user_id
- created_at
- updated_at
- deleted_at nullable

### 2.9 entity_aliases
Helps duplicate resolution and search.

Fields:
- id
- entity_id
- alias_text
- alias_type
- source
- created_at

### 2.10 entity_claims
- id
- entity_id
- requester_user_id
- claim_type
- verification_method
- submitted_phone nullable
- submitted_documents_json nullable
- status
- admin_notes nullable
- approved_by nullable
- approved_at nullable
- created_at
- updated_at

### 2.11 reviews
- id
- entity_id
- author_user_id
- overall_rating
- title nullable
- body
- visit_context nullable
- experience_month nullable
- experience_year nullable
- language_code
- status
- moderation_state
- risk_state
- helpful_count
- not_helpful_count
- fake_vote_count
- under_verification
- published_at nullable
- created_at
- updated_at
- deleted_at nullable

Constraint:
- unique(author_user_id, entity_id)

### 2.12 review_tag_links
- id
- review_id
- tag_id
- intensity nullable
- created_at

### 2.13 review_votes
- id
- review_id
- voter_user_id
- vote_type
- created_at

Constraint:
- unique(review_id, voter_user_id, vote_type)

### 2.14 review_reports
- id
- review_id
- reporter_user_id nullable
- report_type
- reason_text nullable
- status
- created_at
- resolved_at nullable
- resolver_user_id nullable

### 2.15 review_replies
- id
- review_id
- author_user_id
- author_role
- body
- status
- created_at
- updated_at

### 2.16 moderation_cases
- id
- object_type
- object_id
- trigger_type
- severity
- status
- assigned_admin_id nullable
- opened_at
- closed_at nullable

### 2.17 moderation_actions
- id
- case_id
- action_type
- performed_by
- notes nullable
- previous_state_json
- new_state_json
- created_at

### 2.18 duplicate_candidates
- id
- entity_a_id
- entity_b_id
- similarity_score
- reason_codes_json
- status
- created_at
- resolved_at nullable

### 2.19 duplicate_merge_votes
- id
- duplicate_candidate_id
- voter_user_id
- vote
- created_at

### 2.20 trust_score_events
- id
- entity_id
- event_type
- weight
- source_object_type
- source_object_id
- effective_at
- expires_at nullable
- created_at

### 2.21 audit_logs
- id
- actor_user_id nullable
- actor_type
- action
- object_type
- object_id
- metadata_json
- ip_hash nullable
- created_at

### 2.22 notifications
- id
- user_id
- channel
- type
- payload_json
- read_at nullable
- created_at

### 2.23 billing_customers
- id
- user_id
- plan_key
- status
- started_at
- ended_at nullable

### 2.24 billing_invoices
- id
- customer_id
- amount_pkr
- currency
- status
- external_ref nullable
- issued_at
- paid_at nullable

## 3. Important Indexes

- users(phone_e164) unique
- entities(normalized_name)
- entities(entity_fingerprint)
- entities(city_id, locality_id, category_id)
- reviews(entity_id, status, created_at desc)
- reviews(author_user_id, entity_id) unique
- review_votes(review_id)
- duplicate_candidates(status, similarity_score desc)
- trust_score_events(entity_id, effective_at desc)
- moderation_cases(status, severity)

## 4. Entity Fingerprint Strategy

Fingerprint input:
- normalized display name
- city
- locality
- category
- normalized phone if present
- normalized address fragment if present

Use a deterministic hash for candidate matching, not as sole truth.

## 5. Suggested Prisma/Naming Conventions

- snake_case in DB
- camelCase in application layer
- enums for status fields
- dedicated DTO validation layer in API

## 6. Future Tables

- evidence_files
- branch_entities
- service_appointments
- lead_requests
- ad_campaigns
- premium_profile_sections
- saved_searches
- trust_alerts
- search_click_events
- seo_landing_pages
