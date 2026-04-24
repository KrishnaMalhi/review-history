# Security Documentation

## 1. Security Goals

This platform handles:
- user identity data,
- phone numbers,
- user-generated content,
- moderation actions,
- account claims,
- reputation-sensitive public data.

Security goals:
- protect accounts,
- protect PII,
- reduce fake accounts,
- protect moderation integrity,
- protect audit history,
- reduce abuse of public-facing systems.

## 2. Threat Model

## External threats
- credential theft
- OTP abuse
- spam review attacks
- bot signup floods
- DDoS / scraping abuse
- mass reporting attacks
- account takeover
- media abuse later
- admin panel exposure

## Internal / product threats
- moderator mistakes
- overpowered admin actions
- silent review tampering
- weak audit logs
- accidental PII exposure
- insecure duplicate merges
- wrongful entity claims

## 3. Security Controls

## 3.1 Authentication
- OTP-based phone authentication
- short-lived OTP
- hashed OTP storage
- retry limits
- resend cooldown
- country-specific validation
- suspicious device/IP throttling

## 3.2 Session Security
- secure HTTP-only cookies or carefully handled tokens
- rotation for refresh tokens
- device/session visibility
- logout-all-sessions support
- anomaly-based revocation

## 3.3 Authorization
Use role-based + action-based checks:
- guest
- user
- claimed_owner
- moderator
- admin
- super_admin

Critical rule:
No role should bypass audit logging.

## 3.4 Input Validation
- strict schema validation
- size limits
- type validation
- normalization for search
- HTML/script sanitization
- URL validation
- file validation if uploads enabled later

## 3.5 Abuse Controls
- rate limiting
- IP/device fingerprinting
- signup velocity limits
- review velocity limits
- report velocity limits
- vote brigading detection
- review cooldown for new accounts

## 3.6 Data Protection
- encryption in transit
- database encryption at rest where available
- secrets in environment manager
- no plaintext OTP
- no plaintext sensitive admin notes if avoidable
- PII separation from public entity data

## 3.7 Auditability
Audit every sensitive action:
- moderation actions
- review status changes
- entity merges
- claim approvals
- profile edits
- sanctions
- admin logins
- permission changes

## 4. Review Integrity Controls

- one active review per entity per user
- store edit history
- show “edited” marker if review changed materially
- block silent owner alteration of public reviews
- maintain moderation reason codes
- keep removed-content metadata privately for disputes

## 5. Entity Claim Security

Claiming is high risk because a false claim can weaponize the profile.

Controls:
- OTP to known phone if available
- supporting evidence upload
- human review for sensitive categories
- revoke capability
- claim history
- conflict-handling workflow

## 6. Admin Panel Security

- separate admin auth boundary
- role-scoped permissions
- IP allowlisting if feasible
- strong MFA for admins
- action confirmations for destructive operations
- immutable audit logs
- least privilege by default

## 7. Privacy by Design Security Measures

- collect minimum required data
- separate public and private models
- hide reviewer identity publicly by default
- redact personal data in reviews
- allow lawful deletion workflows
- expose only what is needed for trust and discovery

## 8. Infrastructure Security

- Docker images pinned and scanned
- reverse proxy hardening
- TLS everywhere
- regular backup jobs
- restore testing
- DB access restricted
- Redis not public
- object storage signed URLs
- queue workers isolated where possible

## 9. Monitoring and Incident Response

Monitor:
- OTP failures,
- signup spikes,
- review bursts,
- mass reports,
- moderation queue spikes,
- 5xx rate,
- suspicious admin activity,
- auth anomalies.

Incident process:
1. detect
2. classify
3. contain
4. investigate
5. recover
6. document
7. improve controls

## 10. Security Priorities for MVP

Do first:
- OTP hardening
- schema validation
- rate limiting
- audit logs
- admin MFA
- PII minimization
- backups

Do later:
- more advanced bot detection
- advanced device intelligence
- ML anomaly detection
- dedicated WAF tuning

## 11. Security Principle

For this platform, security is not only about servers.  
It is also about **review integrity**, **moderation integrity**, and **claim integrity**.
