# collections module

Receipts against bookings: cash/cheque/UPI/NEFT, receipt numbering, cheque clearance, dues/overdues, idempotent posting.

Route base: `/api/v1/collections` - permissions: `collections:read`, `collections:create`, `collections:update`, `collections:delete` (+ module-specific, see docs/modules/collections.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `collections.controller.ts` -> `class CollectionsController` (HTTP only: parse, guard, delegate) |
| `services/`      | `collections.service.ts` -> `class CollectionsService` (business rules, transactions)   |
| `repositories/`  | `collections.repository.ts` -> `class CollectionsRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `collections.module.ts` -> `class CollectionsModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/collections.e2e-spec.ts`.
