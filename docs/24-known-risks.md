# ReviewHistory — Known Risks

| # | Risk | Impact | Mitigation | Status |
|---|------|--------|-----------|--------|
| 1 | Feed ranking changes break existing UX | High | Defer ranking changes to Phase 2, A/B test | Planned |
| 2 | Medical review misinformation | High | Keyword-based auto-flagging + manual moderation queue | Planned |
| 3 | Salary data manipulation (fake submissions) | Medium | One per user per entity per job title, 24h account age gate | Planned |
| 4 | Invite link abuse (bot-generated reviews) | Medium | Rate limiting, CAPTCHA on invite landing, IP-based throttling | Planned |
| 5 | Employer retaliation against reviewers | High | Anonymous reviews default for workplace, PII detection in review text | Planned |
| 6 | Large migration on production DB | Medium | All changes are additive (new tables/columns), no breaking changes | Mitigated |
| 7 | Category extension complexity growth | Medium | Strict BASE + EXTENSION pattern, no base model changes | Mitigated |
| 8 | Performance impact of response metric calculations | Low | Materialized view pattern, cron-based recalculation, Redis caching | Planned |
| 9 | Badge evaluation at scale | Low | Event-driven evaluation (on review/reply/vote), not polling | Planned |
| 10 | Product image reviews storage costs | Low | Cloudinary free tier initially, size limits (2MB), lazy loading | Planned |
