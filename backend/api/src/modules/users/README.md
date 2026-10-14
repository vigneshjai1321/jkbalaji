# users module

Staff accounts: invite, activate/deactivate, reset password, assign roles, profile.

Route base: `/api/v1/users` - permissions: `users:read`, `users:create`, `users:update`, `users:delete` (+ module-specific, see docs/modules/users.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `users.controller.ts` -> `class UsersController` (HTTP only: parse, guard, delegate) |
| `services/`      | `users.service.ts` -> `class UsersService` (business rules, transactions)   |
| `repositories/`  | `users.repository.ts` -> `class UsersRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `users.module.ts` -> `class UsersModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/users.e2e-spec.ts`.
