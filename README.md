# JK Balaji — Jamavisa Enterprises Private Limited

Production monorepo for **JK Balaji Real Estate** (`jkbalaji.in`), **Cheyyar Balaji Jewellery** (`cheyyarbalaji.com`), and the **Enterprise Admin / ERP** panel (`admin.jkbalaji.in`).

| Layer | Path |
|-------|------|
| Real estate public site | `apps/real-estate-web` (Next.js 15) |
| Jewellery public site | `apps/jewellery-web` (Next.js 15) |
| ERP admin | `apps/admin-panel` (Next.js 15) |
| API | `backend/api` (NestJS 12, `/api/v1`, JWT) |
| Database | `database/prisma`, `database/migrations`, `database/seeds` |
| Shared types | `packages/types` (+ stub `packages/ui`, `utils`, `config`) |
| Deploy | `deployment/` (`deploy.ps1`, `scripts/vps-install.sh`, nginx) |

Live layout, ports, and deploy flags: **`docs/LIVE-ARCHITECTURE.md`**.

## Quick start

```bash
nvm use
npm install
cp backend/api/.env.example backend/api/.env
npm run db:generate
npm run db:migrate:dev
npm run dev:stack:admin    # or dev:stack:re / dev:stack:jewellery
```

## Production deploy (Windows → VPS)

```powershell
cd E:\JKbalaji\deployment
.\deploy.ps1                          # default: admin + API only
.\deploy.ps1 -BuildTargets "all"        # full monorepo
.\deploy.ps1 -BuildTargets "re,jew"     # public sites only
```

Server credentials template: **`PROJECT_CREDENTIALS.example.txt`**. Real `PROJECT_CREDENTIALS.txt` stays on the VPS only (gitignored).

Pre-deploy checks (local):

```bash
npm run check:predeploy:admin
```

## Build

```bash
npm run build        # everything
npm run build:erp    # types + API + admin
npm run build:public # types + both public sites
```
