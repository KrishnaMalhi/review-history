# ReviewHistory — Legal, Privacy & Policy

---

## 🌍 How Global Platforms Survived Legal Threats

Before detailing ReviewHistory's strategy, it's instructive to see how similar platforms handled legal challenges:

| Platform | Legal Challenge | How They Survived |
|----------|----------------|-------------------|
| Glassdoor | Employer defamation lawsuits | Section 230 immunity (US), clear T&C that reviews are opinions |
| Yelp | Business owners sued reviewers | Platform policy: reviews are user opinions, not Yelp statements |
| Trustpilot | Fake review lawsuits | Right of reply, removal policy, transparent moderation |
| RateMDs | Doctor defamation claims | Courts upheld "opinion" defense in most jurisdictions |
| TripAdvisor | Hotel lawsuits | Robust removal policy + Section 230-equivalent protections |

**The common thread:** Every platform survived because:
1. Reviews are clearly labelled as **user opinions**, not platform facts
2. The platform has a clear **right of reply** for the reviewed party
3. There is a **removal policy** for genuinely defamatory content
4. The platform does not **verify the factual accuracy** of reviews (only detects obvious fakes)

---

## 🇵🇰 Pakistan-Specific Risk Assessment

Pakistan does not have a direct equivalent of the US Section 230. However, the following risk analysis applies:

### HIGH Risk (Requires Immediate Legal Protection)

| Risk | Scenario | Mitigation |
|------|----------|------------|
| PECA 2016 Section 20 | Review contains "false information" harming someone's reputation | Opinion language enforcement (see below) |
| PECA 2016 Section 37 | Government orders content removal | Compliance process and transparency report |
| Civil defamation suit | Entity claims a review is defamatory | Removal policy + right of reply + T&C disclaimer |

### MEDIUM Risk (Monitor and Prepare)

| Risk | Scenario | Mitigation |
|------|----------|------------|
| Injunction to remove entity page | Court order to take down entity | Legal response process (see below) |
| Harassment via false reviews | User posts fake negative review as vendetta | Community voting + Admin removal process |
| Privacy Act violation | User includes personal address/phone in review | Content moderation guidelines |

### LOW Risk

| Risk | Scenario | Mitigation |
|------|----------|------------|
| Copyright claim on photos | User uploads copyrighted image | DMCA-style takedown process |
| Trademark dispute | Entity name conflict | Trademark monitoring |

---

## 🛡️ 5 Protection Layers

### Layer 1: Terms & Conditions Statement

Every review submission page must show:

> **By submitting a review, you confirm that:**
> - This review reflects your genuine personal experience
> - You are expressing your personal opinion, not stating verified facts
> - You will not include false information intended to harm anyone's reputation
> - ReviewHistory is not responsible for the content of user reviews

### Layer 2: Opinion Language Enforcement

The platform trains and guides users to write reviews using opinion language:

**Dangerous (factual claim):**
> "Dr. Ahmed has fake degrees"

**Safe (personal experience):**
> "I felt the diagnosis was incorrect. I visited another doctor who found the issue Dr. Ahmed missed."

**Dangerous:**
> "This landlord stole PKR 50,000 from me"

**Safe:**
> "My landlord did not return my PKR 50,000 security deposit. I made multiple requests. He stopped responding."

The review form includes helper text: *"Describe YOUR experience. Say what happened to YOU."*

### Layer 3: Right of Reply

Any claimed business owner can post a response to any review. This is documented in the [Anti-Fake Review System](./09-anti-fake-review-system.md#layer-4-owner-right-of-reply).

This right of reply is the strongest legal defense: it shows the platform is balanced and allows the reviewed party to correct inaccuracies publicly.

### Layer 4: Removal Policy

ReviewHistory will remove content that:

| Content Type | Action | Timeline |
|-------------|--------|----------|
| Contains full name + personal address + phone (doxxing) | Immediate removal | Within 2 hours |
| Directly accuses of a specific criminal act (not just a bad experience) | Admin review | Within 24 hours |
| Confirmed to be written by a competitor (not a genuine customer) | Removal + ban | Within 48 hours |
| Court order or legally valid takedown notice | Compliance | Per court timeline |

**Safe to keep:**
- Negative reviews describing a bad experience, even if the entity disagrees
- Low star ratings without accompanying text
- Warning tags selected by reviewers
- Owner replies that are professional

### Layer 5: Company Registration

To operate legally in Pakistan and to have legal standing:

- Register as a Private Limited company under SECP (Securities and Exchange Commission of Pakistan)
- Obtain NTN (National Tax Number) from FBR
- Register with PTA (Pakistan Telecommunication Authority) if required for OTP services
- Maintain clear company address and contact for legal notices

---

## ⚖️ Step-by-Step: Handling a Legal Threat

### Step 1: Receive Legal Notice
- All legal notices go to a dedicated email: `legal@reviewhistory.pk`
- Acknowledge receipt within 24 hours

### Step 2: Initial Assessment
- Is the content clearly defamatory (false factual claim)?
- Is the content an opinion/experience statement?
- Does the notice meet legal requirements (jurisdiction, standing)?

### Step 3: Respond Within 7 Days
- **Clearly defamatory content:** Remove, notify reviewer, explain in response to notice
- **Opinion content:** Respond with platform T&C, explain content moderation policy, offer right of reply

### Step 4: Right of Reply Offer
- Always offer the complaining party the ability to claim the entity and post an official response
- Document this offer in all legal correspondence

### Step 5: Escalate If Required
- If a court order is received, comply with the order while preserving the reviewer's appeal rights
- Maintain a public transparency report of all removal requests

---

## 🔒 Content Requiring Immediate Removal

### Dangerous Content (Remove Immediately)

- Full home address + full name of a private individual + accusation
- Mobile number of a private individual + accusation
- CNIC number of any individual
- Explicit threats of violence
- Sexual content of any kind
- Content confirmed by admin to be entirely fabricated

### Safe Content (Keep Unless Court Orders Otherwise)

- "My landlord didn't return my deposit" (experience)
- "The doctor prescribed unnecessary tests" (experience)
- "This mechanic installed used parts" (experience)
- 1-star ratings with no text
- Warning tags selected by reviewers

---

## 📋 PECA Compliance Strategy

**Prevention and Electronic Crimes Act 2016 (PECA)** is Pakistan's primary digital law. Key sections:

**Section 20 — Offences Against Dignity of a Natural Person:**
ReviewHistory mitigates by:
- Requiring reviews to describe experiences, not make character judgments
- Training UI to guide opinion language
- Quick removal process for content that crosses into personal attacks

**Section 37 — Unlawful Online Content:**
ReviewHistory's response:
- Maintain a Pakistan-registered company with a legal address
- Respond to PTA removal orders through proper channels
- Keep a compliance log of all government content requests

**Section 29 — Cyber Stalking:**
- Reviews must not contain personal contact information of private individuals
- Content moderation scans for patterns that could constitute harassment

---

## 🔐 Complete Privacy Policy

### Data We Collect

| Data Type | What | Why |
|-----------|------|-----|
| Phone number | Pakistani mobile number | Account verification via OTP |
| Display name | Chosen by user | Optional, personalisation |
| Avatar photo | User-uploaded | Optional, profile display |
| Review content | Text, ratings, photos | Core platform functionality |
| IP address hash | HMAC-SHA256 of IP | Anti-fake detection (raw IP not stored) |
| Device hash | Optional fingerprint | Additional anti-fake signal |
| App usage | Pages viewed, searches | Platform improvement analytics |

### Data We Do NOT Collect

- CNIC or national ID numbers
- Full home address of reviewers
- Real name (display name is optional and user-chosen)
- Financial information (payments via JazzCash/EasyPaisa — we don't store card details)
- Location tracking beyond what the user voluntarily provides

### Data Retention

| Data | Retention Period |
|------|-----------------|
| User account | Until account deletion request |
| Reviews | Until user deletion request or admin removal |
| OTP codes | 24 hours after creation (then auto-deleted) |
| IP hashes | 90 days (anti-fraud use only) |
| App analytics | 12 months aggregated |

### User Rights

Users can at any time:
1. **Access** — Download all their data (reviews, profile)
2. **Correct** — Update their profile information
3. **Delete** — Delete their account and all reviews
4. **Port** — Export their data as JSON

To exercise rights: email `privacy@reviewhistory.pk`

### Third-Party Data Sharing

| Third Party | Data Shared | Purpose |
|-------------|-------------|---------|
| Twilio | Phone number | OTP delivery only |
| Cloudinary | User photos | Photo storage and CDN |
| Railway.app | All data (hosted) | Database hosting |
| Vercel | None | Web hosting |

ReviewHistory does **not** sell user data to any third party.

### Cookie Policy

| Cookie | Type | Purpose |
|--------|------|---------|
| `rh_session` | Essential | JWT authentication |
| `rh_pref` | Functional | Language, theme preferences |
| Analytics | Optional | Platform improvement (opt-out available) |

---

*Last updated: 2026-04-03*
*Governing law: Laws of Pakistan*
*Contact: legal@reviewhistory.pk*
