# Module: Plots

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Plot inventory per project: plot no., dimensions, area (sq.ft/cents/grounds), facing, rate per sq.ft, status lifecycle.

## Code locations
- API: `apps/api/src/modules/plots`
- Web: `apps/web/src/features/plots` + routes in `apps/web/src/app/(dashboard)/plots`
- Contracts: `packages/shared/src/schemas/plots.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`plots:read`, `plots:create`, `plots:update`, `plots:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
