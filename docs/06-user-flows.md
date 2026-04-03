# ReviewHistory — User Flows

All major user journeys through the ReviewHistory platform.

---

## Flow 1: New User Registration

```
User opens app/website
        │
        ▼
   Enter phone number
   (+92XXXXXXXXXX)
        │
        ▼
   Tap "Send OTP"
        │
        ├─── Invalid number ──► Show error "Enter valid Pakistani number"
        │
        ▼
   Twilio sends 6-digit SMS
        │
        ▼
   User enters OTP code
        │
        ├─── Wrong code ──► "Incorrect code. 2 attempts remaining."
        ├─── Expired ──────► "Code expired. Tap Resend."
        │
        ▼
   OTP verified ✓
        │
        ▼
   First time? ──Yes──► Set Display Name (optional, skippable)
        │
        ▼
   JWT token issued, stored securely
        │
        ▼
   ✅ User is logged in — redirected to Home
```

**Technical notes:**
- JWT stored in `expo-secure-store` (mobile) or `httpOnly` cookie (web)
- OTP expires in 5 minutes
- Max 3 wrong attempts before OTP locked (user must request new code)
- Rate limit: 3 OTP requests per phone number per hour

---

## Flow 2: Search and Find Entity

```
User arrives at Home
        │
        ▼
   Types in search bar
   e.g., "Dr Ahmed Johar Town"
        │
        ▼
   Real-time suggestions appear
   (debounced 300ms, min 2 chars)
        │
        ├─── Exact match found ──────► Show entity card
        ├─── Multiple results ───────► Show results list
        └─── No results ─────────────► Show "Add this entity" CTA
        │
        ▼
   User clicks entity card
        │
        ▼
   Entity Detail Page loads
   ┌──────────────────────────────┐
   │  🏥 Dr. Ahmed                │
   │  Johar Town, Lahore          │
   │  Trust Score: 38 🟡 CAUTION  │
   │  ⭐ 2.4 / 5 (24 reviews)     │
   │                              │
   │  ⚠️ Warning Tags:            │
   │  💊 Unnecessary Tests (12)   │
   │  ⏰ Long Wait Times (8)      │
   │  💰 Overcharging (7)         │
   │                              │
   │  [Write Review] [Share]      │
   └──────────────────────────────┘
        │
        ▼
   User scrolls through reviews
        │
        ▼
   User taps "Helpful" on a review
   (requires login)
```

---

## Flow 3: Add Review (Multi-Step — 8 Steps)

```
User taps "Write Review" on entity page
        │
        ▼
   ── STEP 1: Login Check ──
   Already logged in? ──No──► Redirect to login flow
        │ Yes
        ▼
   ── STEP 2: Already Reviewed? ──
   Reviewed before? ──Yes──► "You've already reviewed this entity."
        │ No
        ▼
   ── STEP 3: Overall Rating ──
   ★☆☆☆☆  ★★☆☆☆  ★★★☆☆  ★★★★☆  ★★★★★
   User taps a star (required)
        │
        ▼
   ── STEP 4: Category Ratings ──
   (Doctor example)
   Wait Time:        ★★★☆☆
   Diagnosis Quality: ★★☆☆☆
   Price Fairness:   ★☆☆☆☆
   Staff Behaviour:  ★★★★☆
        │
        ▼
   ── STEP 5: Warning Tags ──
   ☑ Unnecessary Tests
   ☑ Overcharging
   ☐ Long Wait
   ☐ Rude Behaviour
   (Multi-select, optional)
        │
        ▼
   ── STEP 6: Write Review ──
   Title (optional): [________________]
   Experience (min 20 chars, required):
   [________________________________]
   [________________________________]
        │
        ▼
   ── STEP 7: Add Photos ──
   [+ Add Photo] (optional, max 3)
        │
        ▼
   ── STEP 8: Submit ──
   "Your review will be published after
    brief automated checks."
   [Submit Review]
        │
        ▼
   Anti-fake checks run (< 1 second)
        │
        ├─── New account (< 24h) ──► Status: PENDING
        ├─── IP cluster detected ──► Status: FLAGGED
        └─── All clear ────────────► Status: PUBLISHED
        │
        ▼
   ✅ "Review published!" toast shown
   Entity trust score recalculated
   User redirected back to entity page
```

---

## Flow 4: Add New Entity

```
User searches for entity — no results found
        │
        ▼
   "We couldn't find this entity."
   [+ Add It Here]
        │
        ▼
   Login check ──Not logged in──► Login flow
        │ Logged in
        ▼
   ── Add Entity Form ──
   Name:         [Dr. Sana Malik          ]
   Category:     [DOCTOR              ▼   ]
   City:         [Karachi             ▼   ]
   Area:         [Gulshan-e-Iqbal        ]
   Address:      [Block 13-D...          ]
   Phone:        [03111234567  ] (optional)
   Description:  [                       ]
        │
        ▼
   Duplicate check runs:
   ── Potential matches found? ──
        ├─── Yes ──► "Did you mean these?" show list
        │            User can select existing OR confirm "No, add new"
        └─── No ───► Proceed
        │
        ▼
   Entity created in DB
   Trust Score = 50 (default)
        │
        ▼
   ✅ "Entity added!"
   Redirect: "Now write the first review"
```

---

## Flow 5: Owner Claims Entity

```
Business owner finds their entity page
        │
        ▼
   Taps "Claim This Business"
        │
        ▼
   Login check ──Not logged in──► Login flow
        │
        ▼
   ── Claim Form ──
   "Prove you are the owner"
   Written proof: [I am Dr. Sana Malik. My PMDC number is 12345.]
   Upload document: [+ Upload ID / Registration Card]
        │
        ▼
   Claim submitted → status: PENDING
        │
        ▼
   Admin receives notification
        │
        ▼
   Admin reviews evidence (48h SLA)
        │
        ├─── APPROVED ──► Entity.isVerified = true
        │                  Owner can now reply to reviews
        │                  "Verified Owner" badge shown
        │
        └─── REJECTED ──► Email/SMS notification with reason
```

---

## Flow 6: Flag Duplicate Entity

```
User sees two entities that seem identical
        │
        ▼
   Opens one entity page
        │
        ▼
   Taps ⋮ menu → "Flag as Duplicate"
        │
        ▼
   ── Duplicate Flag Form ──
   "Which entity is the original?"
   [Search for original entity...]
   User selects the canonical entity
   Reason: [Same doctor, name spelling differs]
        │
        ▼
   DuplicateFlag created → status: OPEN
        │
        ▼
   Admin reviews:
        ├─── Confirmed duplicate ──► Merge entities
        │                            All reviews move to canonical entity
        │                            Duplicate marked isMerged = true
        │                            Duplicate slug redirects to canonical
        │
        └─── Not a duplicate ──────► Flag dismissed
```

---

## Flow 7: Report Fake Review

```
User reads a review, suspects it's fake
        │
        ▼
   Taps 🚩 "Report" on review
        │
        ▼
   Login check ──Not logged in──► Login
        │
        ▼
   ── Report Form ──
   Reason:
   ○ Fake review
   ○ Defamatory content
   ○ Wrong entity
   ○ Spam
   ○ Other
   Details: [Optional extra context]
        │
        ▼
   Report submitted → status: OPEN
        │
        ▼
   If 5+ reports on same review:
   Review auto-flagged (status: FLAGGED)
   Hidden from public until admin reviews
        │
        ▼
   Admin reviews:
        ├─── REMOVE ──► Review status: REMOVED, no longer visible
        └─── DISMISS ──► Review stays published, reporter notified
```

---

## Flow 8: WhatsApp Share Warning

```
User reads a dangerous entity page
(Trust Score < 40, multiple warning tags)
        │
        ▼
   Taps [Share Warning on WhatsApp]
        │
        ▼
   App generates pre-filled Urdu message:
   ─────────────────────────────────────────
   ⚠️ *خبردار* — ReviewHistory

   *مکان مالک: خالد محمود*
   *علاقہ: جوہر ٹاؤن، لاہور*

   ⭐ ریٹنگ: 1.8 / 5 (12 ریویوز)
   🔴 ٹرسٹ اسکور: 22 — *خطرناک*

   عام شکایات:
   💰 ضمانتی رقم نہیں لوٹائی (8 لوگوں نے کہا)
   🚫 غیر قانونی بے دخلی (5 لوگوں نے کہا)
   🔧 مرمت کام نہیں کیا (7 لوگوں نے کہا)

   👇 پوری تفصیل دیکھیں:
   https://reviewhistory.pk/entities/khalid-mehmood-johar-town-lahore

   *ReviewHistory — جاننا آپ کا حق ہے*
   ─────────────────────────────────────────
        │
        ▼
   WhatsApp app opens with message pre-filled
   User selects contact or group to share
        │
        ▼
   Recipient receives warning message
        │
        ▼
   Recipient taps link → Entity page opens
        │
        ▼
   Recipient reads reviews → clicks "Write Review"
        │
        ▼
   New user signs up → adds their own experience
   ↩ (Viral loop: each share brings new users + reviews)
```

**Viral Loop Explanation:**

```
1 user shares warning to WhatsApp group (avg 200 members)
        │
        ▼
5–10 members click the link (2.5–5% CTR)
        │
        ▼
2–3 sign up and leave their own review
        │
        ▼
Their reviews appear → others share again
        │
        ▼
Platform grows organically with zero ad spend
```

**The WhatsApp share button is the single most important growth feature in ReviewHistory.** It converts every review into a potential acquisition channel.
