# @jkbalaji/api - NestJS 12 REST API

- ESM (`"type": "module"`, NodeNext) - relative imports use the `.js` extension.
- Global prefix + URI versioning: every route is `/api/v1/...`.
- Layering: controller -> service -> repository -> PrismaService (see docs/architecture/ARCHITECTURE.md).
- Auth: JWT access (15 min) + rotating refresh (7 d) in httpOnly cookies; RBAC via `@RequirePermissions()`.
- Prisma 7: `prisma.config.ts` + `prisma/schema.prisma`; client generated to `src/generated/prisma` (git-ignored).
- Production: `npm run build` -> `node dist/main.js` under PM2 (`deploy/pm2/ecosystem.config.js`), bound to 127.0.0.1:4000.
