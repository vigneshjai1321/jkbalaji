# Module: Settings

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Company profile (JK Balaji), branding, receipt/booking number sequences, area units, tax fields, notification templates.

## Code locations
- API: `apps/api/src/modules/settings`
- Web: `apps/web/src/features/settings` + routes in `apps/web/src/app/(dashboard)/settings`
- Contracts: `packages/shared/src/schemas/settings.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`settings:read`, `settings:create`, `settings:update`, `settings:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
