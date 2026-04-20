# ReviewHistory — Change Log

## [Unreleased] — Phase 1: Platform Expansion Foundation

### Added
- **Architecture**: BASE + EXTENSION pattern for category-specific profiles and review data
- **Documentation**: Implementation plan (20), tracking (21), change log (22), pending decisions (23), known risks (24)
- **Database**: New enums and models for all 5 vertical layers + 15 core features

### Planned (Phase 1)
- EmployerProfile, SchoolProfile, MedicalProfile, ProductProfile models
- WorkplaceReviewData, SchoolReviewData, MedicalReviewData, ProductReviewData models
- ReviewInvite system (/r/:token growth loop)
- Follow system (entity + category)
- Badge system (entity + user badges)
- EntityResponseMetric (response rate, avg time, issues resolved)
- IssueResolution flow
- AnalyticsEvent tracking
- Community validation actions (confirmed, outdated, resolved)
- ReviewQualityScore
- ReviewStreak + Challenge system
- OnboardingPreference
