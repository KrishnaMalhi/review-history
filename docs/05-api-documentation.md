# ReviewHistory — API Documentation

> **Base URL:** `https://api.reviewhistory.pk/v1`
> **Auth:** Bearer JWT token in `Authorization` header
> **Format:** JSON request and response bodies

---

## 🔐 Authentication

### POST /auth/send-otp

Send a one-time password to a Pakistani mobile number.

**Auth required:** No

**Request:**
```json
{
  "phone": "+923001234567"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Errors:**

| Code | Reason |
|------|--------|
| 400 | Invalid phone number format |
| 429 | Too many OTP requests (rate limit: 3/hour) |

---

### POST /auth/verify-otp

Verify OTP and receive JWT access token.

**Auth required:** No

**Request:**
```json
{
  "phone": "+923001234567",
  "code": "847291"
}
```

**Response 200 (new user):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+923001234567",
    "displayName": null,
    "avatarUrl": null,
    "role": "USER",
    "createdAt": "2026-04-03T05:51:00.000Z"
  }
}
```

**Errors:**

| Code | Reason |
|------|--------|
| 400 | Invalid OTP code |
| 401 | OTP expired |
| 401 | Too many failed attempts (OTP locked) |

---

### PATCH /auth/profile

Update the authenticated user's profile.

**Auth required:** Yes

**Request:**
```json
{
  "displayName": "Ali Khan",
  "bio": "Tenant in Lahore for 5 years",
  "avatarUrl": "https://res.cloudinary.com/reviewhistory/image/upload/v1234567890/avatar.jpg"
}
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "Ali Khan",
  "bio": "Tenant in Lahore for 5 years",
  "avatarUrl": "https://res.cloudinary.com/...",
  "updatedAt": "2026-04-03T06:00:00.000Z"
}
```

---

### GET /auth/me

Get the authenticated user's profile and stats.

**Auth required:** Yes

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "+923001234567",
  "displayName": "Ali Khan",
  "avatarUrl": "https://res.cloudinary.com/...",
  "bio": "Tenant in Lahore for 5 years",
  "role": "USER",
  "reviewCount": 4,
  "createdAt": "2026-04-03T05:51:00.000Z"
}
```

---

## 🏢 Entities

### GET /entities

List entities with filtering and pagination.

**Auth required:** No

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category enum |
| `city` | string | Filter by city name |
| `area` | string | Filter by area |
| `sort` | string | `trustScore` \| `newest` \| `mostReviewed` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "abc123",
      "slug": "dr-ahmed-johar-town-lahore",
      "name": "Dr. Ahmed",
      "category": "DOCTOR",
      "city": "Lahore",
      "area": "Johar Town",
      "trustScore": 72,
      "avgRating": 3.8,
      "totalReviews": 24,
      "isVerified": false,
      "photoUrl": null
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### GET /entities/:id

Get full entity detail including top warning tags.

**Auth required:** No

**Response 200:**
```json
{
  "id": "abc123",
  "slug": "dr-ahmed-johar-town-lahore",
  "name": "Dr. Ahmed",
  "category": "DOCTOR",
  "city": "Lahore",
  "area": "Johar Town",
  "address": "45-B Johar Town, Lahore",
  "description": null,
  "photoUrl": null,
  "trustScore": 72,
  "avgRating": 3.8,
  "totalReviews": 24,
  "isVerified": false,
  "warningTags": [
    { "tag": "overcharging", "count": 12 },
    { "tag": "long_wait", "count": 8 }
  ],
  "ratingBreakdown": {
    "5": 6,
    "4": 4,
    "3": 7,
    "2": 4,
    "1": 3
  },
  "createdAt": "2026-01-15T00:00:00.000Z"
}
```

---

### POST /entities

Add a new entity to the platform.

**Auth required:** Yes

**Request:**
```json
{
  "name": "Dr. Sana Malik",
  "category": "DOCTOR",
  "city": "Karachi",
  "area": "Gulshan-e-Iqbal",
  "address": "Block 13-D, Gulshan-e-Iqbal, Karachi",
  "phone": "03111234567",
  "description": "General physician and internal medicine specialist"
}
```

**Response 201:**
```json
{
  "id": "def456",
  "slug": "dr-sana-malik-gulshan-e-iqbal-karachi",
  "name": "Dr. Sana Malik",
  "category": "DOCTOR",
  "city": "Karachi",
  "area": "Gulshan-e-Iqbal",
  "trustScore": 50,
  "avgRating": 0,
  "totalReviews": 0,
  "createdAt": "2026-04-03T06:00:00.000Z"
}
```

**Errors:**

| Code | Reason |
|------|--------|
| 409 | Similar entity already exists (returns potential duplicates) |

---

### POST /entities/:id/claim

Submit a claim to be the owner of an entity.

**Auth required:** Yes

**Request:**
```json
{
  "proofDescription": "I am Dr. Sana Malik. My PMDC registration number is 12345.",
  "proofPhotoUrl": "https://res.cloudinary.com/.../pmdc-card.jpg"
}
```

**Response 201:**
```json
{
  "id": "claim-uuid",
  "entityId": "def456",
  "status": "PENDING",
  "message": "Claim submitted. Admin will review within 48 hours."
}
```

---

### POST /entities/:id/flag-duplicate

Flag an entity as a duplicate.

**Auth required:** Yes

**Request:**
```json
{
  "duplicateOfId": "abc123",
  "reason": "Same doctor listed twice with slightly different name spelling"
}
```

**Response 201:**
```json
{
  "id": "flag-uuid",
  "status": "OPEN",
  "message": "Duplicate flag submitted. Admin will review."
}
```

---

## ⭐ Reviews

### GET /entities/:id/reviews

Get published reviews for an entity.

**Auth required:** No

**Query params:** `page`, `limit`, `sort` (`newest` | `highest` | `lowest` | `mostHelpful`)

**Response 200:**
```json
{
  "data": [
    {
      "id": "rev-uuid",
      "rating": 2,
      "title": "Very long wait, unnecessary tests",
      "body": "Waited 2.5 hours despite having an appointment...",
      "status": "PUBLISHED",
      "helpfulCount": 18,
      "fakeCount": 1,
      "warningTags": ["long_wait", "unnecessary_tests"],
      "photos": [],
      "author": {
        "id": "user-uuid",
        "displayName": "Anonymous User",
        "avatarUrl": null
      },
      "ownerReply": null,
      "createdAt": "2026-03-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 10
  }
}
```

---

### POST /entities/:id/reviews

Submit a new review for an entity.

**Auth required:** Yes

**Request:**
```json
{
  "rating": 2,
  "title": "Very long wait, unnecessary tests",
  "body": "Waited 2.5 hours despite having an appointment. Was prescribed 6 tests, all came back normal. The clinic seems designed to generate lab referral income.",
  "warningTags": ["long_wait", "unnecessary_tests"],
  "photos": [
    "https://res.cloudinary.com/.../receipt.jpg"
  ],
  "ratings": {
    "wait_time": 1,
    "diagnosis_quality": 2,
    "price_fairness": 2,
    "staff_behaviour": 3
  }
}
```

**Response 201:**
```json
{
  "id": "new-rev-uuid",
  "status": "PUBLISHED",
  "message": "Review published successfully!"
}
```

**Errors:**

| Code | Reason |
|------|--------|
| 409 | User already reviewed this entity |
| 400 | Review body too short (min 20 chars) |

---

### DELETE /reviews/:id

Delete own review.

**Auth required:** Yes (owner of review or admin)

**Response 200:**
```json
{ "message": "Review deleted successfully" }
```

---

### POST /reviews/:id/vote

Vote a review as helpful or fake.

**Auth required:** Yes

**Request:**
```json
{ "isHelpful": true }
```

**Response 200:**
```json
{
  "helpfulCount": 19,
  "fakeCount": 1,
  "yourVote": "helpful"
}
```

**Errors:**

| Code | Reason |
|------|--------|
| 409 | User already voted on this review |
| 403 | Cannot vote on own review |

---

### POST /reviews/:id/report

Report a review to admins.

**Auth required:** Yes

**Request:**
```json
{
  "reason": "FAKE_REVIEW",
  "details": "This review is clearly written by a competitor. The entity has no negative reviews from real customers."
}
```

**Response 201:**
```json
{ "message": "Report submitted. Our team will review within 24 hours." }
```

---

### POST /reviews/:id/reply

Owner posts a reply to a review on their claimed entity.

**Auth required:** Yes (must be approved claim owner)

**Request:**
```json
{
  "body": "Thank you for your feedback. We have since reduced wait times to under 30 minutes. Please visit us again."
}
```

**Response 201:**
```json
{
  "id": "reply-uuid",
  "body": "Thank you for your feedback...",
  "createdAt": "2026-04-03T08:00:00.000Z"
}
```

---

## 🔍 Search

### GET /search

Full-text search across entities.

**Auth required:** No

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (required) |
| `category` | string | Filter by category |
| `city` | string | Filter by city |
| `area` | string | Filter by area |
| `page` | number | Page (default: 1) |
| `limit` | number | Per page (default: 20) |

**Example:** `GET /search?q=Dr+Ahmed&city=Lahore&category=DOCTOR`

**Response 200:**
```json
{
  "query": "Dr Ahmed",
  "data": [
    {
      "id": "abc123",
      "slug": "dr-ahmed-johar-town-lahore",
      "name": "Dr. Ahmed",
      "category": "DOCTOR",
      "city": "Lahore",
      "area": "Johar Town",
      "trustScore": 72,
      "avgRating": 3.8,
      "totalReviews": 24,
      "matchScore": 0.92
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20 }
}
```

---

## 📤 Upload

### POST /upload/image

Upload an image to Cloudinary.

**Auth required:** Yes

**Request:** `multipart/form-data` with field `file`

**Constraints:** Max 5MB, JPEG/PNG/WebP only

**Response 200:**
```json
{
  "url": "https://res.cloudinary.com/reviewhistory/image/upload/v1234567890/reviews/abc123.jpg",
  "publicId": "reviews/abc123",
  "width": 1200,
  "height": 900
}
```

---

## 🛡️ Admin Endpoints

> All admin endpoints require `Authorization: Bearer <token>` with `role = ADMIN` or `MODERATOR`.

### GET /admin/reports

List all open review reports.

**Query params:** `status` (`OPEN` | `RESOLVED` | `DISMISSED`), `page`, `limit`

**Response 200:** Paginated list of Report objects with embedded review and reporter details.

---

### PATCH /admin/reports/:id

Resolve or dismiss a report.

**Request:**
```json
{
  "status": "RESOLVED",
  "action": "REMOVE_REVIEW"
}
```

---

### PATCH /admin/reviews/:id/status

Change a review's status.

**Request:**
```json
{
  "status": "REMOVED",
  "reason": "Defamatory content confirmed after review"
}
```

---

### POST /admin/entities/merge

Merge a duplicate entity into the canonical one (moves all reviews).

**Request:**
```json
{
  "sourceEntityId": "duplicate-uuid",
  "targetEntityId": "canonical-uuid"
}
```

**Response 200:**
```json
{
  "message": "Merged successfully. 7 reviews moved to target entity.",
  "targetEntity": { "id": "canonical-uuid", "totalReviews": 31 }
}
```

---

### GET /admin/stats

Platform-wide statistics dashboard.

**Response 200:**
```json
{
  "users": { "total": 1240, "newToday": 18 },
  "reviews": { "total": 4820, "pending": 14, "flagged": 6 },
  "entities": { "total": 892, "unverified": 870 },
  "reports": { "open": 12 }
}
```

---

### PATCH /admin/users/:id/ban

Ban or unban a user.

**Request:**
```json
{
  "isBanned": true,
  "reason": "Repeatedly posting fake reviews for competitor businesses"
}
```

---

## 📂 Categories

### GET /categories

List all entity categories with metadata.

**Auth required:** No

**Response 200:**
```json
[
  {
    "key": "LANDLORD",
    "label": "Landlord",
    "labelUrdu": "مکان مالک",
    "icon": "🏠",
    "totalEntities": 234
  },
  {
    "key": "DOCTOR",
    "label": "Doctor",
    "labelUrdu": "ڈاکٹر",
    "icon": "👨‍⚕️",
    "totalEntities": 189
  }
]
```

---

### GET /warning-tags

List all warning tags for a given category.

**Query params:** `category` (required)

**Response 200:**
```json
[
  {
    "tag": "deposit_kept",
    "label": "Security Deposit Kept",
    "labelUrdu": "ضمانتی رقم نہیں لوٹائی",
    "emoji": "💰",
    "count": 87
  },
  {
    "tag": "illegal_eviction",
    "label": "Illegal Eviction",
    "labelUrdu": "غیر قانونی بے دخلی",
    "emoji": "🚫",
    "count": 43
  }
]
```
