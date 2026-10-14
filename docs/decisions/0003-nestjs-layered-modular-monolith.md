# 0003. NestJS 12 layered modular monolith
- Status: Accepted, 2026-10-07
## Context
The business app will live a long time, with about 12 modules, RBAC, and audit requirements. NestJS 12 (current) is ESM-only.
## Decision
One NestJS app. Each module has controllers/services/repositories/dto/entities/interfaces. Only repositories touch Prisma. The API uses ESM (`"type": "module"`, NodeNext) and Vitest instead of Jest.
## Consequences
+ Clear boundaries; modules could be extracted later.
- ESM requires `.js` extensions in relative imports, and some older Nest community packages may lag behind. Fallback: Nest 11 (CommonJS) is a valid downgrade if a critical library blocks.
