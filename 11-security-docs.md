# 11 — Security Docs

## 1. Security Goals

- prevent account abuse
- protect user data
- protect moderation/admin functions
- preserve auditability
- defend against fake review attacks

## 2. Authentication Security

- OTP with cooldowns
- attempt throttling
- one-time code expiration
- JWT access tokens with short TTL
- rotating refresh tokens
- device/session revocation
- admin accounts require stronger controls

## 3. Authorization

Use RBAC + resource checks.

Roles:
- guest
- user
- claimed_owner
- moderator
- admin
- super_admin

Examples:
- only author can edit review within policy window
- only claimed owner can reply
- only moderator/admin can hide/remove content
- only admin can merge entities or approve complex claims

## 4. Threat Model

### Main threats
- OTP abuse / enumeration
- credential/session theft
- fake review farms
- spam bursts
- admin misuse
- privacy leaks
- mass scraping
- DDoS on public search pages

## 5. Core Controls

### App layer
- strict DTO validation
- output encoding
- CSRF strategy where cookie-based flows exist
- file upload restrictions
- idempotency on writes

### API layer
- rate limits by IP/device/user/phone
- WAF or edge filtering
- abuse scoring
- endpoint-specific quotas

### Data layer
- least privilege DB access
- encrypted backups
- secrets manager
- row-level care in admin views where needed

## 6. Logging and Monitoring

Log:
- auth events
- OTP requests/verify failures
- suspicious review bursts
- moderation actions
- claim approvals
- admin actions
- unusual query patterns

Alert on:
- rapid OTP spikes
- large-scale entity creation
- repeated duplicate review attempts
- privilege escalations
- moderation backlog surges

## 7. Review Abuse Security Controls

- one review per entity per user
- review velocity limits
- burst controls per IP/device
- suspicious vote pattern detection
- per-entity anomaly detection

## 8. Admin Security

- separate admin routes/subdomain
- mandatory MFA if feasible
- IP allowlisting for super admin if feasible
- break-glass procedures
- immutable audit logs

## 9. Data Protection Controls

- hash/salt secrets and tokens
- encrypt sensitive fields where justified
- minimize retention of raw IPs
- redact internal notes from public APIs

## 10. Security Testing

- automated dependency scanning
- API authz tests
- review workflow abuse tests
- rate limit tests
- penetration testing before scale
