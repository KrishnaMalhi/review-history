# 18 - Implementation Gap Map (Code vs Spec)

Snapshot date: 2026-04-17

## 1. Implemented in Codebase

### API (`review-history-api`)
- OTP auth (`/auth/request-otp`, `/auth/verify-otp`, `/auth/refresh`, `/auth/logout`)
- Categories/tags/cities/localities endpoints
- Entity create/get/update
- Search entities endpoint
- Reviews create/list/update/delete
- Votes and reports on reviews
- Replies
- Entity claims (+ admin claim actions/listing)
- Notifications
- Moderation case listing/detail/resolve
- Admin user management and dashboard endpoints
- Trust endpoint (`/entities/:entityId/trust`)
- Global validation, error formatting, response envelope, JWT guard

### Web (`review-history-web`)
- Public pages: home, search, categories, entity detail, legal pages
- Auth UI (login/verify)
- Add entity + add review pages
- Dashboard views (reviews, claims, saved)
- Notifications page and header dropdown

### Admin (`review-history-admin`)
- Project scaffolding present; active integration depends on current route usage in repo.

## 2. Partially Implemented / Inconsistent

1. API contract consistency:
   - historical mismatch between docs and runtime keys (`pageSize` vs `limit`, `categoryKey` vs `category`, `cityId` vs `city`)
   - compatibility aliases now mapped in search.
2. Pagination response shape:
   - API now returns both `items/pagination` and `data/meta` for compatibility.
3. Category payload shape:
   - frontend needed `name`, `icon`, `description`; API now normalizes category response accordingly.
4. Security headers:
   - CORS/CSP origin mapping now supports separate web/admin origin env keys.

## 3. Still Pending Against Full Spec

1. Evidence/document verification workflow depth
2. Advanced risk heuristics and configurable review weighting
3. Full legal complaint intake + case lifecycle UX
4. Billing/checkout/subscription implementation depth
5. Duplicate merge community flow and redirect lifecycle completion
6. Rich trust score explanation UI and trend visualization
7. Broader observability dashboards and alert tuning

## 4. Env Mapping (CORS)

Use these keys in API `.env`:

- `CORS_ORIGIN_WEB=http://localhost:3000`
- `CORS_ORIGIN_ADMIN=http://localhost:3002`

Runtime behavior:

1. API accepts both origins in CORS allowlist.
2. CSP `connect-src` includes both origins.
3. Legacy `CORS_ORIGIN` remains supported (comma-separated if needed).

## 5. Immediate Runtime Fixes Included

1. Throttler env values coerced to numbers to avoid malformed reset/retry calculations.
2. Search endpoint accepts both canonical and legacy query names.
3. Web search/notifications requests updated to canonical query names.
