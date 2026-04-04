# 06 — User Flows

This doc covers 8 important user journeys.

## 1. Search Existing Entity and Read Reviews

```text
User
  -> Home/Search
  -> enters name / phone / area / category
  -> search results
  -> opens entity profile
  -> sees trust score + warnings + reviews + reply history
  -> decides whether to proceed in real life
```

## 2. Add Missing Entity and Leave First Review

```text
User
  -> searches entity
  -> no result found
  -> clicks "Add this person/business"
  -> fills category + name + location + optional phone
  -> duplicate check runs
  -> entity created
  -> review form shown
  -> review submitted
  -> trust score generated
```

## 3. OTP Signup Flow

```text
User
  -> enters Pakistani phone number
  -> receives OTP
  -> verifies OTP
  -> account created / resumed
  -> session issued
```

## 4. Submit Review with Trust Checks

```text
Authenticated User
  -> opens add review
  -> selects rating
  -> writes opinion-based review
  -> chooses warning tags
  -> submits
  -> server checks:
     - one review per entity
     - rate limit
     - duplicate behavior
     - risky wording
     - account age / velocity
  -> publish OR mark under verification
```

## 5. Community Voting on Review Quality

```text
Reader
  -> reads review
  -> marks helpful / seems fake
  -> signal stored
  -> aggregate voting affects trust weighting and moderation visibility
```

## 6. Entity Claim Flow

```text
Reviewed Person/Business
  -> finds entity page
  -> clicks "Claim profile"
  -> verifies phone or uploads evidence
  -> admin / rule engine checks
  -> claim approved
  -> can now reply publicly
```

## 7. Duplicate Entity Merge

```text
User/Admin/System
  -> duplicate candidates identified
  -> community/admin validates similarity
  -> merge performed
  -> aliases preserved
  -> reviews reattached to surviving entity
  -> redirects created
```

## 8. Legal/Policy Complaint Flow

```text
Claimant / Lawyer / Business
  -> files complaint
  -> case created
  -> policy review starts
  -> if content violates policy:
       remove / redact / hide
     else:
       keep content and allow reply path
  -> case resolution logged
```

## Detailed Narrative Flows

## A. Rental Warning Flow
1. User hears about a rental property.
2. Searches landlord name or property location.
3. Finds entity page.
4. Reads repeated warning tags like deposit issues or hidden charges.
5. Shares profile with family/friends over WhatsApp.
6. Platform gains organic distribution.

## B. Doctor Discovery Flow
1. User searches doctor by name and area.
2. Multiple same-name doctors appear.
3. User uses locality and landmark cues.
4. Sees trust score, wait-time comments, fee transparency complaints, and owner reply quality.
5. Chooses with greater confidence.

## C. Business Reputation Recovery Flow
1. Business notices negative page.
2. Claims profile.
3. Responds politely.
4. Improves profile completeness.
5. Uses premium analytics.
6. Builds trust through transparency, not review deletion.

## D. Reviewer Safety Flow
1. User writes review.
2. UI warns against personal information and criminal accusations.
3. User submits opinion-based language.
4. Risk engine scores review.
5. Review is published safely or held for checks.

## Flow Design Rules
- keep search low friction
- keep review submission medium friction
- keep claim and moderation high integrity
- show users why decisions happened
