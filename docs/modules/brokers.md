# Module: Brokers

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Channel partners/agents: profiles, commission rules, commission accruals per booking, payouts.

## Code locations
- API: `apps/api/src/modules/brokers`
- Web: `apps/web/src/features/brokers` + routes in `apps/web/src/app/(dashboard)/brokers`
- Contracts: `packages/shared/src/schemas/brokers.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`brokers:read`, `brokers:create`, `brokers:update`, `brokers:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
