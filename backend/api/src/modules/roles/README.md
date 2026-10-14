# roles module

Roles & permissions: role CRUD, permission matrix (resource:action), assignment. Permission catalog is code-defined in packages/shared.

Route base: `/api/v1/roles` - permissions: `roles:read`, `roles:create`, `roles:update`, `roles:delete` (+ module-specific, see docs/modules/roles.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `roles.controller.ts` -> `class RolesController` (HTTP only: parse, guard, delegate) |
| `services/`      | `roles.service.ts` -> `class RolesService` (business rules, transactions)   |
| `repositories/`  | `roles.repository.ts` -> `class RolesRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `roles.module.ts` -> `class RolesModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/roles.e2e-spec.ts`.
