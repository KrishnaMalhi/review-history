# Admin Taxonomy Management Implementation Tracking

Date: 2026-05-05

## Status

Implemented and typechecked.

## Backend

- [x] Extended `ReviewType` with patient/student/parent/employee/staff/teacher/alumni/customer experience types.
- [x] Extended `Category` with SEO, public visibility, timestamps, and soft delete fields.
- [x] Added `Subcategory` model and relations.
- [x] Extended `WarningTag` with subcategory, reviewType, reviewerRole, public/internal visibility, sort order, description, and soft delete.
- [x] Added `ReviewCriteria` model for dynamic review form configuration.
- [x] Added `ReviewRatingCriteria` model for per-review criteria ratings.
- [x] Added entity subcategory relation.
- [x] Added review subcategory and reviewerRole fields.
- [x] Added migration: `20260505100000_taxonomy_management`.
- [x] Added idempotent seed for Health/Education taxonomy, tags, and criteria.
- [x] Added admin category detail and activate/inactivate endpoints.
- [x] Added admin subcategory CRUD/status endpoints.
- [x] Added admin tag CRUD/status endpoints.
- [x] Added admin review criteria CRUD/status endpoints.
- [x] Added public subcategory API.
- [x] Updated public category API to return active/public records and nested subcategories.
- [x] Updated public tags API to filter active/public/non-internal records.
- [x] Added public review criteria config API.
- [x] Added audit logs for taxonomy create/update/delete/status actions.

## Admin Frontend

- [x] Updated categories management with SEO and public visibility fields.
- [x] Added `/subcategories` management page.
- [x] Added `/tags` management page.
- [x] Added `/review-criteria` management page.
- [x] Added taxonomy pages to admin sidebar.
- [x] Added admin entity creation subcategory selection.
- [x] Added hooks for admin taxonomy APIs.

## Web Frontend

- [x] Added public subcategory and review criteria hooks.
- [x] Updated public entity creation to select subcategory from backend taxonomy.
- [x] Updated write-review form with expanded review types and reviewer role.
- [x] Updated write-review form to load tags by category/subcategory/reviewType/reviewerRole.
- [x] Updated write-review form to load dynamic review criteria from backend and submit criteria ratings.

## Verification

- [x] `npx prisma generate --schema prisma/schema.prisma --no-engine` passed in `review-history-api`.
- [x] `npx tsc --noEmit` passed in `review-history-api`.
- [x] `npx tsc --noEmit` passed in `review-history-admin`.
- [x] `npx tsc --noEmit` passed in `review-history-web`.

## Notes

- Automated API tests for taxonomy CRUD were not added because the existing request was implemented directly against current service/controller patterns and the repository test setup was not expanded in this pass.
- Runtime database migration still needs to be applied in the developer environment before using the new taxonomy tables.
