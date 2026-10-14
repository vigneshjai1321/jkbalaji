# plots module

Plot inventory per project: plot no., dimensions, area (sq.ft/cents/grounds), facing, rate per sq.ft, status lifecycle.

Route base: `/api/v1/plots` - permissions: `plots:read`, `plots:create`, `plots:update`, `plots:delete` (+ module-specific, see docs/modules/plots.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `plots.controller.ts` -> `class PlotsController` (HTTP only: parse, guard, delegate) |
| `services/`      | `plots.service.ts` -> `class PlotsService` (business rules, transactions)   |
| `repositories/`  | `plots.repository.ts` -> `class PlotsRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `plots.module.ts` -> `class PlotsModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/plots.e2e-spec.ts`.
