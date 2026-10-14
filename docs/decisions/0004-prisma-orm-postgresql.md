# 0004. Prisma ORM 7 + PostgreSQL
- Status: Accepted, 2026-10-07
## Context
We need relational integrity for financial data, migrations, type safety, and a low memory footprint on a small VPS.
## Decision
PostgreSQL 16+ with Prisma ORM 7.10: `prisma-client` generator (ESM output to `src/generated/prisma`), the `@prisma/adapter-pg` driver adapter, and `prisma.config.ts` for the datasource URL, migrations, and seed. Complex reports may use `$queryRaw`/TypedSQL inside repositories.
## Consequences
+ Readable schema, reviewed SQL migrations, typed queries, no Rust engine (lower RAM).
- Client regeneration on schema changes, and less SQL control than Drizzle or Kysely. Prisma 8 is in RC, so evaluate the upgrade after GA.
See ARCHITECTURE.md section 3.1 for the full justification.
