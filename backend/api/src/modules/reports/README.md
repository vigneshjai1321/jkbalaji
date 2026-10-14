# reports module

Analytics & exports: sales, collections, outstanding/ageing, broker commission, project P&L, CSV/XLSX/PDF export.

Route base: `/api/v1/reports` - permissions: `reports:read`, `reports:create`, `reports:update`, `reports:delete` (+ module-specific, see docs/modules/reports.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `reports.controller.ts` -> `class ReportsController` (HTTP only: parse, guard, delegate) |
| `services/`      | `reports.service.ts` -> `class ReportsService` (business rules, transactions)   |
| `repositories/`  | `reports.repository.ts` -> `class ReportsRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `reports.module.ts` -> `class ReportsModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/reports.e2e-spec.ts`.
