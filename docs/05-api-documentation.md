# 05 — API Documentation

Base path: `/api/v1`

## 1. Authentication

### POST /auth/request-otp
Request OTP for a Pakistani phone number.

Request:
```json
{
  "phone": "+923001234567"
}
```

Response:
```json
{
  "success": true,
  "otpRequestId": "otp_req_123",
  "cooldownSeconds": 60
}
```

### POST /auth/verify-otp
```json
{
  "otpRequestId": "otp_req_123",
  "code": "482911"
}
```

Response:
```json
{
  "success": true,
  "accessToken": "jwt_access",
  "refreshToken": "jwt_refresh",
  "user": {
    "id": "usr_1",
    "phone": "+923001234567"
  }
}
```

### POST /auth/refresh
### POST /auth/logout

## 2. Categories

### GET /categories
### GET /categories/:categoryKey/tags

## 3. Search & Discovery

### GET /search/entities?q=akram&city=lahore&category=landlord
Search entities.

Response:
```json
{
  "items": [
    {
      "id": "ent_1",
      "name": "Haji Muhammad Akram",
      "category": "landlord",
      "city": "Lahore",
      "locality": "Johar Town",
      "trustScore": 23,
      "averageRating": 1.4,
      "reviewCount": 12
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### GET /entities/:id
Get entity profile.

### GET /entities/:id/reviews
Supports filters:
- sort = newest|highest|lowest|helpful
- status = published
- withSuspicious = true|false

## 4. Entity Creation & Editing

### POST /entities
```json
{
  "categoryKey": "landlord",
  "displayName": "Haji Muhammad Akram",
  "cityId": "city_lahore",
  "localityId": "loc_johar_town",
  "phone": "+923001234567",
  "addressLine": "House 47, Street 3",
  "landmark": "Near main market"
}
```

Server actions:
- normalize fields
- duplicate candidate search
- either create fresh entity or suggest possible duplicate

Response:
```json
{
  "success": true,
  "entityId": "ent_1",
  "duplicateCandidates": []
}
```

### PATCH /entities/:id
Restricted. Only policy-safe fields editable.

## 5. Reviews

### POST /entities/:id/reviews
```json
{
  "overallRating": 1,
  "title": "Deposit issue",
  "body": "In my experience, the deposit was not returned on time.",
  "tagKeys": ["deposit_not_returned", "hidden_charges"],
  "experienceMonth": 2,
  "experienceYear": 2026,
  "languageCode": "en"
}
```

Rules:
- one review per entity per user
- content safety checks
- rate limits
- moderation pre-check
- suspicious pattern scoring

Response:
```json
{
  "success": true,
  "reviewId": "rev_1",
  "status": "published",
  "underVerification": false
}
```

### PATCH /reviews/:id
Only within a limited edit window, or through moderation tooling.

### DELETE /reviews/:id
User-initiated deletion or moderation route based on policy.

## 6. Review Voting & Reporting

### POST /reviews/:id/votes
```json
{
  "voteType": "helpful"
}
```

Allowed:
- helpful
- not_helpful
- seems_fake

### POST /reviews/:id/reports
```json
{
  "reportType": "personal_information",
  "reasonText": "Contains private phone number"
}
```

## 7. Replies

### POST /reviews/:id/replies
For claimed entity owners or admins.

```json
{
  "body": "We disagree with this account and invite the reviewer to contact us."
}
```

### GET /reviews/:id/replies

## 8. Claiming Entities

### POST /entities/:id/claims
```json
{
  "claimType": "owner",
  "verificationMethod": "phone_otp",
  "submittedPhone": "+923001234567"
}
```

### POST /entity-claims/:id/submit-documents
### GET /me/entity-claims

## 9. Duplicate Handling

### GET /entities/:id/possible-duplicates
### POST /duplicate-candidates/:id/votes
```json
{
  "vote": "same_entity"
}
```

## 10. Trust Score

### GET /entities/:id/trust-score
Response:
```json
{
  "entityId": "ent_1",
  "trustScore": 23,
  "ratingScore": 14,
  "volumeScore": 6,
  "consistencyScore": 4,
  "riskPenalty": -8,
  "lastCalculatedAt": "2026-04-03T10:00:00Z"
}
```

## 11. Me / User Area

### GET /me
### GET /me/reviews
### GET /me/saved-entities
### GET /me/notifications

## 12. Admin Moderation

### GET /admin/moderation/cases
### GET /admin/moderation/cases/:id
### POST /admin/moderation/cases/:id/actions

Example action:
```json
{
  "actionType": "hide_review",
  "notes": "Contains clear personal information"
}
```

### POST /admin/entities/:id/merge
### POST /admin/entity-claims/:id/approve
### POST /admin/entity-claims/:id/reject

## 13. Billing

### GET /billing/plans
### POST /billing/checkout
### GET /billing/subscription

## 14. Error Shape

```json
{
  "success": false,
  "error": {
    "code": "REVIEW_ALREADY_EXISTS",
    "message": "You have already reviewed this entity."
  }
}
```

## 15. Idempotency

Critical write endpoints should support `Idempotency-Key` header:
- request OTP
- create entity
- create review
- create claim
- moderation actions
