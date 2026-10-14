# settings module

Company profile (JK Balaji), branding, receipt/booking number sequences, area units, tax fields, notification templates.

Route base: `/api/v1/settings` - permissions: `settings:read`, `settings:create`, `settings:update`, `settings:delete` (+ module-specific, see docs/modules/settings.md).

| Folder           | File naming convention (examples)                                      |
|------------------|------------------------------------------------------------------------|
| `controllers/`   | `settings.controller.ts` -> `class SettingsController` (HTTP only: parse, guard, delegate) |
| `services/`      | `settings.service.ts` -> `class SettingsService` (business rules, transactions)   |
| `repositories/`  | `settings.repository.ts` -> `class SettingsRepository` (the ONLY place using PrismaService) |
| `dto/`           | `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts` (bind shared Zod schemas) |
| `entities/`      | `<entity>.entity.ts` - response shape / mapper from Prisma model to API view |
| `interfaces/`    | `<name>.interface.ts` - internal contracts (e.g. repository filters)   |
| (root)           | `settings.module.ts` -> `class SettingsModule`                                   |

Tests: `*.spec.ts` next to the file under test; e2e in `apps/api/test/e2e/settings.e2e-spec.ts`.
