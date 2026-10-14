# seeds

- `seed.ts` - entry point run by `npm run db:seed` (configured in `prisma.config.ts`). Idempotent (upserts).
- `data/permissions.ts` - permission catalog imported from `@jkbalaji/shared`.
- `data/roles.ts` - default roles: SUPER_ADMIN, ADMIN, SALES_MANAGER, SALES_EXECUTIVE, ACCOUNTANT, VIEWER.
- `data/settings.ts` - company profile defaults (JK Balaji, INR, Asia/Kolkata, number sequences).
- `dev/` - optional demo data (sample project, 50 plots) - never run in production.
