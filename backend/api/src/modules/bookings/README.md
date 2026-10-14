# bookings module

Plot booking/agreement: token advance, sale value, payment plan/instalment schedule, cancellation/transfer, registration status.

Route base: `/api/v1/bookings` - permissions: `bookings:read`, `bookings:create`, `bookings:update`, `bookings:delete` (+ module-specific, see docs/modules/bookings.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `bookings.controller.ts` -> `class BookingsController` (HTTP only: parse, guard, delegate) |
| `services/`      | `bookings.service.ts` -> `class BookingsService` (business rules, transactions)   |
| `repositories/`  | `bookings.repository.ts` -> `class BookingsRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `bookings.module.ts` -> `class BookingsModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/bookings.e2e-spec.ts`.
