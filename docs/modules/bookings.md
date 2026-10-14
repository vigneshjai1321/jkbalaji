# Module: Bookings

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Plot booking/agreement: token advance, sale value, payment plan/instalment schedule, cancellation/transfer, registration status.

## Code locations
- API: `apps/api/src/modules/bookings`
- Web: `apps/web/src/features/bookings` + routes in `apps/web/src/app/(dashboard)/bookings`
- Contracts: `packages/shared/src/schemas/bookings.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`bookings:read`, `bookings:create`, `bookings:update`, `bookings:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
