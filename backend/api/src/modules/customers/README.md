# customers module

CRM: leads, site visits, follow-ups, customer KYC (masked), lead source, assignment to sales executives.

Route base: `/api/v1/customers` - permissions: `customers:read`, `customers:create`, `customers:update`, `customers:delete` (+ module-specific, see docs/modules/customers.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `customers.controller.ts` -> `class CustomersController` (HTTP only: parse, guard, delegate) |
| `services/`      | `customers.service.ts` -> `class CustomersService` (business rules, transactions)   |
| `repositories/`  | `customers.repository.ts` -> `class CustomersRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `customers.module.ts` -> `class CustomersModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/customers.e2e-spec.ts`.
