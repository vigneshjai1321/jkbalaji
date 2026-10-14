# Module: Expenses

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Project/office expenses: categories, vendor, bill attachment, approval, project-wise cost tracking.

## Code locations
- API: `apps/api/src/modules/expenses`
- Web: `apps/web/src/features/expenses` + routes in `apps/web/src/app/(dashboard)/expenses`
- Contracts: `packages/shared/src/schemas/expenses.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`expenses:read`, `expenses:create`, `expenses:update`, `expenses:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
