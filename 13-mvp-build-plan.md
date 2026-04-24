# 13 — MVP Build Plan

## Goal

Ship a strong side-project MVP in 8 weeks using a lean stack and solo-founder-friendly scope.

## Recommended Stack for a Side Project

- Next.js frontend
- NestJS backend
- PostgreSQL
- Prisma
- Redis
- Tailwind
- Vercel or self-hosted frontend
- VPS or managed backend container
- basic object storage
- local analytics + error tracking

## Week 1 — Setup and Design
Day 1: repo setup, environments, CI
Day 2: database base schema, migrations
Day 3: auth module skeleton
Day 4: frontend shell, routing, layout
Day 5: category/location seed data
Day 6: design system basics
Day 7: polish and review

## Week 2 — OTP Auth
Day 8: request OTP endpoint
Day 9: verify OTP endpoint
Day 10: session/refresh token flow
Day 11: auth UI
Day 12: rate limits and cooldowns
Day 13: device/session capture
Day 14: testing

## Week 3 — Entities
Day 15: categories and tags APIs
Day 16: entity schema
Day 17: create entity endpoint
Day 18: entity search endpoint
Day 19: detail page
Day 20: duplicate candidate logic v0
Day 21: testing

## Week 4 — Reviews
Day 22: review schema and endpoint
Day 23: one-review-per-entity enforcement
Day 24: review list UI
Day 25: review composer UI
Day 26: tag chips and filters
Day 27: helpful/fake voting
Day 28: testing

## Week 5 — Trust and Risk
Day 29: trust score service
Day 30: entity aggregates
Day 31: suspicious review rules v1
Day 32: under-verification state
Day 33: moderation case creation
Day 34: trust score UI
Day 35: testing

## Week 6 — Claims and Replies
Day 36: entity claim request
Day 37: claimant verification steps
Day 38: owner replies endpoint
Day 39: owner dashboard basics
Day 40: admin approval screens
Day 41: audit logs
Day 42: testing

## Week 7 — Legal and Production Readiness
Day 43: privacy / terms / policy pages
Day 44: report review flow
Day 45: complaint process backend
Day 46: analytics events
Day 47: SEO basics
Day 48: monitoring and alerting
Day 49: staging QA

## Week 8 — Launch Prep
Day 50: city/category seed content
Day 51: onboarding flows
Day 52: WhatsApp sharing
Day 53: landing page and positioning
Day 54: bug fixes
Day 55: smoke testing
Day 56: soft launch

## MVP Deliverables
- OTP auth
- entity creation
- search
- reviews
- tags
- trust score
- duplicate suggestions
- claims
- replies
- moderation queue
- legal pages
- basic analytics
