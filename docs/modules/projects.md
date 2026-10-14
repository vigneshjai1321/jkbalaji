# Module: Projects

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Layouts/ventures: name, location, survey numbers, approvals (DTCP/CMDA/RERA no.), phases/blocks, layout map.

## Code locations
- API: `apps/api/src/modules/projects`
- Web: `apps/web/src/features/projects` + routes in `apps/web/src/app/(dashboard)/projects`
- Contracts: `packages/shared/src/schemas/projects.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`projects:read`, `projects:create`, `projects:update`, `projects:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
