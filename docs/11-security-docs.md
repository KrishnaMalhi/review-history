# ReviewHistory — Security Documentation

---

## 🔐 Phone OTP Security Flow

```
1. User submits phone number (+923001234567)
2. Server validates format (Pakistani numbers only: /^\+92[0-9]{10}$/)
3. Rate limit check: max 3 OTP requests per phone per hour
4. Generate 6-digit random OTP: Math.floor(100000 + Math.random() * 900000)
5. Store in OtpCode table: { phone, code, expiresAt: now+5min, attempts: 0 }
6. Send via Twilio SMS API
7. Return: { success: true, expiresIn: 300 }

On verify:
1. Find latest unused OTP for phone number
2. Check if expired → 401 "OTP expired"
3. Increment attempts counter
4. If attempts >= 3 → mark OTP as used, return 401 "Too many attempts"
5. Compare code (constant-time comparison to prevent timing attacks)
6. If mismatch → 401 "Invalid code"
7. Mark OTP as used (used = true)
8. Upsert user with phone number (create if new, find if existing)
9. Sign JWT: { userId, phone, role }
10. Return JWT access token
```

**OTP Security Properties:**

| Property | Value | Reason |
|----------|-------|--------|
| Code length | 6 digits | 1,000,000 combinations |
| Expiry | 5 minutes | Limits brute force window |
| Max attempts | 3 per code | Forces attacker to request new code |
| Rate limit | 3 requests/hour | Prevents SMS flooding |
| Comparison | Constant-time | Prevents timing oracle attacks |

---

## 🔑 JWT Token Security

```typescript
// Token generation (AuthService)
const payload = {
  sub: user.id,           // Subject: user UUID
  phone: user.phone,      // For quick validation
  role: user.role,        // USER / ADMIN / MODERATOR
  iat: Math.floor(Date.now() / 1000),  // Issued at
};

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '7d',        // 7-day expiry
});
```

**JWT Security Properties:**

| Property | Value |
|----------|-------|
| Algorithm | HS256 (HMAC-SHA256) |
| Secret length | Minimum 256 bits (32 bytes) |
| Expiry | 7 days |
| Storage (web) | httpOnly, Secure, SameSite=Strict cookie |
| Storage (mobile) | expo-secure-store (iOS Keychain / Android Keystore) |
| Refresh strategy | Re-authenticate via OTP (no refresh token) |

**JWT Guard (NestJS):**

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (user.isBanned) {
      throw new ForbiddenException('Account banned');
    }
    return user;
  }
}
```

---

## 🚦 Rate Limiting

All sensitive endpoints are protected with rate limiting via `@nestjs/throttler`:

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `POST /auth/send-otp` | 3 requests | 1 hour per phone | Prevent SMS bombing |
| `POST /auth/verify-otp` | 5 requests | 15 minutes per IP | Prevent brute force |
| `POST /entities/:id/reviews` | 10 reviews | 1 hour per user | Prevent review flooding |
| `POST /reviews/:id/vote` | 50 votes | 1 hour per user | Prevent vote manipulation |
| `POST /reviews/:id/report` | 20 reports | 1 hour per user | Prevent report abuse |
| `GET /search` | 60 requests | 1 minute per IP | Prevent scraping |
| `POST /upload/image` | 20 uploads | 1 hour per user | Prevent storage abuse |
| `POST /entities` | 5 entities | 1 hour per user | Prevent entity spam |

---

## 🔒 IP Hashing Function

Raw IP addresses are never stored. They are hashed using HMAC-SHA256 with a secret:

```typescript
import { createHmac } from 'crypto';

/**
 * Hashes an IP address using HMAC-SHA256.
 * The secret ensures that hashes cannot be reversed even with the raw IP.
 * Different secrets across deployments ensure hashes are not globally linkable.
 */
export function hashIp(ip: string): string {
  return createHmac('sha256', process.env.IP_HASH_SECRET!)
    .update(ip.trim())
    .digest('hex');
}

// Usage in ReviewsService:
const ipHash = hashIp(request.ip);  // stored as 64-char hex string
```

**Why HMAC instead of plain hash:**
- Plain `SHA256(ip)` can be reversed: attacker knows the IP space (IPv4 = 4 billion addresses)
- HMAC with secret prevents rainbow table attacks
- The IP Hash Secret rotates annually, making old hashes un-linkable to new ones

---

## 🛡️ SQL Injection Prevention

ReviewHistory uses **Prisma ORM exclusively** for all database queries. Prisma uses parameterised queries internally, making SQL injection structurally impossible for standard CRUD operations.

```typescript
// ✅ SAFE — Prisma parameterised query
const reviews = await prisma.review.findMany({
  where: {
    entityId: entityId,  // Prisma escapes this automatically
    status: 'PUBLISHED',
  },
});

// ✅ SAFE — Raw query with tagged template literal (Prisma escapes params)
const results = await prisma.$queryRaw`
  SELECT * FROM "Entity"
  WHERE "city" ILIKE ${city}
  AND "category" = ${category}
`;

// ❌ NEVER DO THIS — string interpolation in raw query (not used in codebase)
// const results = await prisma.$queryRawUnsafe(`SELECT * WHERE city = '${city}'`);
```

All raw queries in the codebase use Prisma's tagged template literal syntax (`$queryRaw`) which enforces parameter binding.

---

## 🛡️ XSS Prevention

### Input Sanitization (Server-Side)

All user-generated text content is sanitized before storage:

```typescript
import sanitizeHtml from 'sanitize-html';

// In ReviewsService.create()
const sanitizedBody = sanitizeHtml(createReviewDto.body, {
  allowedTags: [],          // Strip all HTML tags
  allowedAttributes: {},    // No attributes allowed
  disallowedTagsMode: 'recursiveEscape',
});
```

### Output Escaping (Client-Side)

React and Next.js escape all rendered content by default. Dynamic content is never injected via `dangerouslySetInnerHTML`.

### Content Security Policy Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",  // unsafe-eval needed for Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: res.cloudinary.com",
      "connect-src 'self' https://api.reviewhistory.pk",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];
```

---

## ✅ DTO Validation Example

All incoming request data is validated using `class-validator` before reaching the service layer:

```typescript
import { IsString, IsInt, Min, Max, MinLength, MaxLength,
         IsArray, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => sanitizeHtml(value, { allowedTags: [] }))
  title?: string;

  @IsString()
  @MinLength(20, { message: 'Review must be at least 20 characters' })
  @MaxLength(2000, { message: 'Review cannot exceed 2000 characters' })
  @Transform(({ value }) => sanitizeHtml(value, { allowedTags: [] }))
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warningTags?: string[];

  @IsOptional()
  @IsArray()
  photos?: string[];
}
```

NestJS global validation pipe rejects any request that fails these constraints with a `400 Bad Request` response.

---

## 🌐 CORS Configuration

```typescript
// main.ts (NestJS bootstrap)
app.enableCors({
  origin: [
    'https://reviewhistory.pk',
    'https://www.reviewhistory.pk',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,           // Allow cookies
  maxAge: 3600,                // Preflight cache 1 hour
});
```

---

## 🗺️ Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Fake review farm (coordinated fake accounts) | HIGH | HIGH | Phone OTP lock, IP hashing, new account PENDING status |
| SQL injection | LOW | CRITICAL | Prisma ORM with parameterised queries throughout |
| JWT token theft (web) | MEDIUM | HIGH | httpOnly cookie, short expiry, re-auth via OTP |
| XSS via review content | MEDIUM | HIGH | sanitize-html server-side, React escaping client-side |
| SMS OTP flooding / DoS | MEDIUM | MEDIUM | Rate limit 3/hour per phone, Twilio abuse monitoring |
| Admin account takeover | LOW | CRITICAL | Admin accounts require OTP + strong JWT secret |
| Data breach (database) | LOW | HIGH | Railway.app managed DB, SSL connections, no raw passwords stored |
| PECA government takedown | MEDIUM | HIGH | Legal compliance, transparent removal policy, company registration |

---

## 👮 Admin Security Measures

Admin and Moderator accounts have additional protections:

1. **Role check on every request** — `@Roles('ADMIN')` decorator validates JWT role claim
2. **No shared accounts** — every admin has their own phone number
3. **Admin action audit log** — every admin action (ban, remove, merge) is logged with `userId + timestamp + action + reason`
4. **IP-based admin access restriction** (Year 1+) — admin panel only accessible from known IPs
5. **Critical actions require double confirmation** — merging entities, banning users require typed confirmation in UI

```typescript
// Admin role guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```
