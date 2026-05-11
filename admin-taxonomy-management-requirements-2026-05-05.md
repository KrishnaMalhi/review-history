# Admin Taxonomy Management Requirements

Date: 2026-05-05

## Scope

Implement dynamic taxonomy management for ReviewHistory instead of hardcoding Health and Education in frontend components.

Admin must manage:
- Categories
- Subcategories
- Tags
- Review criteria / dynamic review form configuration

Public APIs must consume only active and public taxonomy records from the backend.

## Required Admin Capabilities

Categories:
- Create, list, detail, edit, delete
- Activate and inactivate
- Manage icon, description, SEO title, SEO description, sort order, and public visibility

Subcategories:
- Create under category, list, detail, edit, delete
- Activate and inactivate
- Manage icon, entity type, description, SEO title, SEO description, sort order, and public visibility

Tags:
- Create, list, detail, edit, delete
- Activate and inactivate
- Assign to category, subcategory, review type, and reviewer role
- Manage public/internal visibility, positive/negative flag, severity, and sort order

Review criteria:
- Create, list, detail, edit, delete
- Activate and inactivate
- Assign to category, subcategory, and review type
- Manage criteria key, label, rating scale, required flag, and sort order

## Required Endpoints

Categories:
- `GET /admin/categories`
- `GET /admin/categories/:id`
- `POST /admin/categories`
- `PATCH /admin/categories/:id`
- `DELETE /admin/categories/:id`
- `PATCH /admin/categories/:id/activate`
- `PATCH /admin/categories/:id/inactivate`

Subcategories:
- `GET /admin/subcategories`
- `GET /admin/subcategories/:id`
- `POST /admin/subcategories`
- `PATCH /admin/subcategories/:id`
- `DELETE /admin/subcategories/:id`
- `PATCH /admin/subcategories/:id/activate`
- `PATCH /admin/subcategories/:id/inactivate`

Tags:
- `GET /admin/tags`
- `GET /admin/tags/:id`
- `POST /admin/tags`
- `PATCH /admin/tags/:id`
- `DELETE /admin/tags/:id`
- `PATCH /admin/tags/:id/activate`
- `PATCH /admin/tags/:id/inactivate`

Review criteria:
- `GET /admin/review-criteria`
- `GET /admin/review-criteria/:id`
- `POST /admin/review-criteria`
- `PATCH /admin/review-criteria/:id`
- `DELETE /admin/review-criteria/:id`
- `PATCH /admin/review-criteria/:id/activate`
- `PATCH /admin/review-criteria/:id/inactivate`

List APIs must support search, status/category/subcategory/reviewType filters, pagination, and sorting.

## MVP Seed Taxonomy

Active public categories:
- Health
- Education

Health subcategories:
- Hospitals
- Clinics
- Doctors
- Laboratories

Education subcategories:
- Schools
- Colleges
- Universities
- Coaching Centers / Academies

Seed tags and criteria for:
- Health Patient Experience
- Health Staff Experience
- Education Student Experience
- Education Parent Experience
- Education Teacher / Staff Experience
- Education Alumni Experience

## Rules

- Do not hardcode MVP taxonomy in frontend components.
- Seed Health and Education for MVP, but keep taxonomy expandable.
- Public APIs return only active and public records.
- Public tags also exclude internal tags.
- Admin can see inactive/private/internal records.
- Prefer inactivation/soft delete when records are already linked.
- Log taxonomy admin actions in audit logs where possible.
