# brokers module

Channel partners/agents: profiles, commission rules, commission accruals per booking, payouts.

Route base: `/api/v1/brokers` - permissions: `brokers:read`, `brokers:create`, `brokers:update`, `brokers:delete` (+ module-specific, see docs/modules/brokers.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `brokers.controller.ts` -> `class BrokersController` (HTTP only: parse, guard, delegate) |
| `services/`      | `brokers.service.ts` -> `class BrokersService` (business rules, transactions)   |
| `repositories/`  | `brokers.repository.ts` -> `class BrokersRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `brokers.module.ts` -> `class BrokersModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/brokers.e2e-spec.ts`.
