# Module: Customers

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
CRM: leads, site visits, follow-ups, customer KYC (masked), lead source, assignment to sales executives.

## Code locations
- API: `apps/api/src/modules/customers`
- Web: `apps/web/src/features/customers` + routes in `apps/web/src/app/(dashboard)/customers`
- Contracts: `packages/shared/src/schemas/customers.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`customers:read`, `customers:create`, `customers:update`, `customers:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
