# Module: Reports

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Analytics & exports: sales, collections, outstanding/ageing, broker commission, project P&L, CSV/XLSX/PDF export.

## Code locations
- API: `apps/api/src/modules/reports`
- Web: `apps/web/src/features/reports` + routes in `apps/web/src/app/(dashboard)/reports`
- Contracts: `packages/shared/src/schemas/reports.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`reports:read`, `reports:create`, `reports:update`, `reports:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
