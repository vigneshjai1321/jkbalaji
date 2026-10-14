# database

Location of the Prisma integration (Phase 1):

- `database.module.ts` - `@Global()` module exporting `PrismaService`.
- `prisma.service.ts` - extends the generated `PrismaClient` (import from `../generated/prisma/client.js`),
  constructed with `new PrismaPg({ connectionString, max })` driver adapter; `onModuleInit` -> `$connect()`,
  `enableShutdownHooks`. Only **repositories** inject PrismaService.
- `prisma-error.mapper.ts` - maps `PrismaClientKnownRequestError` codes to domain errors.
- `transaction.helper.ts` - `runInTransaction(fn)` wrapper for multi-repository writes (booking + schedule + commission).

Generated client output: `src/generated/prisma/` (git-ignored, produced by `npm run prisma:generate`).
