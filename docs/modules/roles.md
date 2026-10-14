# Module: Roles

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Roles & permissions: role CRUD, permission matrix (resource:action), assignment. Permission catalog is code-defined in packages/shared.

## Code locations
- API: `apps/api/src/modules/roles`
- Web: `apps/web/src/features/roles` + routes in `apps/web/src/app/(dashboard)/roles`
- Contracts: `packages/shared/src/schemas/roles.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`roles:read`, `roles:create`, `roles:update`, `roles:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
