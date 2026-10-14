# expenses module

Project/office expenses: categories, vendor, bill attachment, approval, project-wise cost tracking.

Route base: `/api/v1/expenses` - permissions: `expenses:read`, `expenses:create`, `expenses:update`, `expenses:delete` (+ module-specific, see docs/modules/expenses.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `expenses.controller.ts` -> `class ExpensesController` (HTTP only: parse, guard, delegate) |
| `services/`      | `expenses.service.ts` -> `class ExpensesService` (business rules, transactions)   |
| `repositories/`  | `expenses.repository.ts` -> `class ExpensesRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `expenses.module.ts` -> `class ExpensesModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/expenses.e2e-spec.ts`.
