# Live architecture (verified from repo + deployment config)

This document separates **verified** facts (present in this repository or `ecosystem.config.cjs` / nginx configs) from **unverified** production details (exact Hostinger plan, disk usage, backup schedule).

## Applications (four runtimes + shared types)

| App | Package | Path | Dev port | PM2 name | Public URL (production) |
|-----|---------|------|----------|----------|-------------------------|
| Real estate site | `@jkbalaji/real-estate-web` | `apps/real-estate-web` | 3000 | `jkbalaji-realestate` | https://jkbalaji.in |
| Jewellery site | `@jkbalaji/jewellery-web` | `apps/jewellery-web` | 3001 | `jkbalaji-jewellery` | https://cheyyarbalaji.com |
| ERP admin | `@jkbalaji/admin-panel` | `apps/admin-panel` | 3002 | `jkbalaji-admin` | https://admin.jkbalaji.in |
| REST API | `@jkbalaji/api` | `backend/api` | 4000 | `jkbalaji-api` | https://api.jkbalaji.in/api/v1 |

**Verified:** Each public site and admin is its own Next.js 15 app (not a single multi-host app). The root README previously implied admin lived inside `real-estate-web`; that is outdated.

**Shared:** `@jkbalaji/types` (`packages/types`) is built before app/API builds in deploy scripts.

**Stub packages:** `packages/ui`, `packages/utils`, `packages/config` exist as workspace placeholders; apps do not currently depend on `@jkbalaji/ui` in a meaningful way.

## Database

| Item | Location |
|------|----------|
| Prisma schema | `database/prisma` (used by `@jkbalaji/api`) |
| SQL migrations | `database/migrations` |
| Seeds | `database/seeds` |

**Verified locally:** API uses PostgreSQL via `DATABASE_URL` in `backend/api/.env` (from `.env.example`).

**Unverified:** Production PostgreSQL version, connection pooling, and backup retention on the VPS.

## Authentication (admin / API)

**Verified in code:** Admin panel uses client-side JWT storage (`localStorage`, key `jk_token`) and `adminFetch` to call the API. API uses NestJS JWT (`@nestjs/jwt`, Passport).

**Note:** ADRs under `docs/decisions/` may describe httpOnly cookies; the live admin app path above is what the repo implements today.

## Development commands

```bash
nvm use
npm install
cp backend/api/.env.example backend/api/.env
# optional per-app .env.local from each app's .env.example when present
npm run db:generate
npm run db:migrate:dev   # local only; not part of Phase 1 deploy verification

npm run dev:stack:admin      # types + API + admin
npm run dev:stack:jewellery  # types + API + jewellery site
npm run dev:stack:re         # types + API + real-estate site
npm run dev                  # legacy: types + API + real-estate only
```

## Build & test commands

```bash
npm run build              # all apps
npm run build:erp          # types + API + admin (typical ERP release)
npm run build:public       # types + both public sites
npm run typecheck:erp
npm run test:api
npm run check:predeploy:admin   # typecheck + test + build:erp
```

## Deployment (Windows → VPS)

**Verified scripts:**

| Script | Role |
|--------|------|
| `deployment/deploy.ps1` | Tarball upload, SSH install, fail-closed exit codes |
| `deployment/scripts/vps-install.sh` | `BUILD_TARGETS`, prune stale paths, npm build per target, PM2 partial restart |
| `deployment/scripts/prune-stale-paths.sh` | Manifest-only deletes (`removed-src-paths.txt`) |
| `deployment/scripts/verify-deploy.sh` | Requires `logs/last-deploy-build.ok`, PM2 online for targets, API health when api/admin/all |

**Environment variables (remote install):**

- `BUILD_TARGETS` — comma list: `admin`, `api`, `re`, `jew`, `all` (default on VPS script: `admin,api,re,jew`; `deploy.ps1` default: `admin,api`).
- `SKIP_DB_MIGRATE=1` — skip `prisma migrate deploy` (use for deploys that must not touch schema).
- `SKIP_DB_SEED=1` — skip seed (default from `deploy.ps1`).
- `DRY_RUN=1` — prune script logs only, no deletes.

**Production paths (from ecosystem / scripts):** `/root/jkbalaji` on VPS `46.202.160.193` (as configured in `deploy.ps1` — confirm before each deploy).

**Not run in Phase 1:** executing `deploy.ps1` against production, PM2 changes on the server, migrations, or seeds as part of agent verification.

## nginx / SSL

Configs under `deployment/nginx/`. Certbot domain list is in `deploy.ps1` (jkbalaji.in, admin/api subdomains, cheyyarbalaji.com).

**Unverified:** Current certificate expiry and nginx vhost state on the live server.

## Billing module (ERP)

**Verified:** Backend module at `backend/api/src/modules/billing/`; invoice numbering in `invoice-numbering.ts`; admin UI under `apps/admin-panel` (billing routes/components).
