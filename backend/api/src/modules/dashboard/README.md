# dashboard module

Role-aware KPIs: plots available/booked/sold, today's collections, overdue dues, lead funnel.

Route base: `/api/v1/dashboard` - permissions: `dashboard:read`, `dashboard:create`, `dashboard:update`, `dashboard:delete` (+ module-specific, see docs/modules/dashboard.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `dashboard.controller.ts` -> `class DashboardController` (HTTP only: parse, guard, delegate) |
| `services/`      | `dashboard.service.ts` -> `class DashboardService` (business rules, transactions)   |
| `repositories/`  | `dashboard.repository.ts` -> `class DashboardRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `dashboard.module.ts` -> `class DashboardModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/dashboard.e2e-spec.ts`.
