# Module: Dashboard

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Role-aware KPIs: plots available/booked/sold, today's collections, overdue dues, lead funnel.

## Code locations
- API: `apps/api/src/modules/dashboard`
- Web: `apps/web/src/features/dashboard` + routes in `apps/web/src/app/(dashboard)/dashboard`
- Contracts: `packages/shared/src/schemas/dashboard.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`dashboard:read`, `dashboard:create`, `dashboard:update`, `dashboard:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
