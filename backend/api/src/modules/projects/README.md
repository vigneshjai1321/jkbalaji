# projects module

Layouts/ventures: name, location, survey numbers, approvals (DTCP/CMDA/RERA no.), phases/blocks, layout map.

Route base: `/api/v1/projects` - permissions: `projects:read`, `projects:create`, `projects:update`, `projects:delete` (+ module-specific, see docs/modules/projects.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `projects.controller.ts` -> `class ProjectsController` (HTTP only: parse, guard, delegate) |
| `services/`      | `projects.service.ts` -> `class ProjectsService` (business rules, transactions)   |
| `repositories/`  | `projects.repository.ts` -> `class ProjectsRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `projects.module.ts` -> `class ProjectsModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/projects.e2e-spec.ts`.
