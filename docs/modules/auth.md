# Module: Auth (core)

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Login, refresh-token rotation, logout, current user, password reset, lockout. Lives in apps/api/src/core/auth and apps/web/src/features/auth.

## Code locations
- API: `apps/api/src/core/auth`
- Web: `apps/web/src/features/auth`
- Contracts: `packages/shared/src/schemas/auth.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`auth:read`, `auth:create`, `auth:update`, `auth:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
