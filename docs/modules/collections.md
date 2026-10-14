# Module: Collections

Status: **stub** (spec to be completed before the module's build phase; see docs/PROJECT-PLAN.md)

## Scope
Receipts against bookings: cash/cheque/UPI/NEFT, receipt numbering, cheque clearance, dues/overdues, idempotent posting.

## Code locations
- API: `apps/api/src/modules/collections`
- Web: `apps/web/src/features/collections` + routes in `apps/web/src/app/(dashboard)/collections`
- Contracts: `packages/shared/src/schemas/collections.schema.ts`, enums in `packages/shared/src/enums`

## To specify
- [ ] Entities and fields (link to schema.prisma models)
- [ ] Status lifecycle / business rules
- [ ] Endpoints (method, path, permission)
- [ ] Screens (list, detail, form) and filters
- [ ] Permissions (`collections:read`, `collections:create`, `collections:update`, `collections:delete`, plus special actions)
- [ ] Reports / exports touching this module
- [ ] Open questions for JK Balaji
