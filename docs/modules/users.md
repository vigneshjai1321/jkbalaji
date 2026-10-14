# Module: Users

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Staff accounts: invite, activate/deactivate, reset password, assign roles, profile.

## Code locations
- API: `apps/api/src/modules/users`
- Web: `apps/web/src/features/users` + routes in `apps/web/src/app/(dashboard)/users`
- Contracts: `packages/shared/src/schemas/users.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`users:read`, `users:create`, `users:update`, `users:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
