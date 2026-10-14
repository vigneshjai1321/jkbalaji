# Folder structure: JK Balaji REMS

Annotated tree with the purpose of every folder. Repeating per-module folders are shown once with `<module>`, and the
complete generated tree is in the [appendix](#appendix-complete-tree). Kebab-case is used everywhere, which is safe on Windows.

Modules (`<module>`): `dashboard, projects, plots, customers, bookings, collections, brokers, expenses, reports, users, roles, settings`
(`roles` covers roles **and** permissions).

```
JKbalaji/                              repo root (unzips into E:\JKbalaji)
├── package.json                       npm workspaces + orchestration scripts (dev/build/lint/test/db:*)
├── tsconfig.base.json                 strict TS settings shared by every package
├── .nvmrc  .editorconfig  .prettierrc .prettierignore  .gitignore  .gitattributes  .npmrc
├── .vscode/                           recommended extensions + workspace settings
├── README.md                          project overview and quick start
│
├── apps/
│   ├── web/                           Next.js 15 App Router frontend (staff back-office)
│   │   ├── package.json  next.config.ts  tailwind.config.ts  postcss.config.mjs
│   │   ├── tsconfig.json  eslint.config.mjs  .env.example
│   │   ├── public/assets/
│   │   │   ├── images/                photos, layout renders
│   │   │   ├── icons/                 custom SVG icons
│   │   │   ├── logos/                 JK Balaji logo variants, favicon sources
│   │   │   └── fonts/                 self-hosted fonts (no runtime Google Fonts call)
│   │   ├── tests/{unit,e2e}/          Vitest UI tests, Playwright browser tests
│   │   └── src/
│   │       ├── middleware.ts          optimistic auth redirect (placement: sibling of app/)
│   │       ├── app/                   ROUTES ONLY (thin pages)
│   │       │   ├── layout.tsx         root html/body + global CSS
│   │       │   ├── page.tsx           redirects to /dashboard
│   │       │   ├── (auth)/            public pages: login/, forgot-password/, reset-password/
│   │       │   └── (dashboard)/       authenticated shell; one folder per <module> (URL /<module>)
│   │       ├── components/            shared design system (no feature imports)
│   │       │   ├── ui/                primitives (shadcn/ui on Radix): button, dialog, select...
│   │       │   ├── layout/            sidebar, topbar, breadcrumbs, page-header
│   │       │   ├── charts/            Recharts wrappers with brand theme
│   │       │   ├── tables/            TanStack Table data-table, pagination, toolbar
│   │       │   ├── forms/             RHF field components: INR amount, area, date, upload
│   │       │   ├── feedback/          loading/empty/error states, toasts, confirm dialog
│   │       │   └── data-display/      stat-card, status-badge, inr-amount, timeline
│   │       ├── features/<module>/     vertical slice per module (+ features/auth/)
│   │       │   ├── components/        module UI (tables, forms, badges)
│   │       │   ├── hooks/             TanStack Query hooks + query keys
│   │       │   ├── api/               typed endpoint functions
│   │       │   ├── types/             UI view-model types
│   │       │   └── schemas/           form schemas (extend shared Zod)
│   │       ├── lib/
│   │       │   ├── api/               fetch client: envelope, ApiError, refresh-retry
│   │       │   ├── auth/              session helpers, can() permission check
│   │       │   ├── utils/             cn(), query-string, download helpers
│   │       │   └── formatters/        INR (lakh/crore), area units, IST dates
│   │       ├── hooks/                 generic hooks (debounce, pagination params, permission)
│   │       ├── providers/             QueryClient, theme, toaster, session providers
│   │       ├── store/                 Zustand UI-only stores
│   │       ├── styles/globals.css     Tailwind v4 entry (@import + @config)
│   │       ├── config/                validated public env, navigation map, site config
│   │       └── types/                 global/ambient declarations
│   │
│   └── api/                           NestJS 12 REST API (ESM) + Prisma 7
│       ├── package.json  nest-cli.json  tsconfig.json  tsconfig.build.json
│       ├── vitest.config.ts  prisma.config.ts  .env.example
│       ├── prisma/
│       │   ├── schema.prisma          generator + datasource + planned-model catalogue
│       │   ├── migrations/            versioned SQL migrations (prisma migrate)
│       │   └── seeds/{data,dev}/      idempotent seeds: permissions, roles, settings; dev demo data
│       ├── test/{e2e,factories,fixtures,utils}/   API e2e tests (Vitest + supertest)
│       └── src/
│           ├── main.ts                bootstrap: /api prefix, URI versioning v1, bind 127.0.0.1
│           ├── app.module.ts          root module importing all feature modules
│           ├── config/                Zod env validation + registerAs() per domain
│           ├── common/                cross-cutting, domain-agnostic
│           │   ├── decorators/        @CurrentUser, @Public, @ApiPaginated
│           │   ├── guards/            generic guards (throttle behind proxy, idempotency)
│           │   ├── interceptors/      response envelope, logging, timeout, audit
│           │   ├── filters/           AllExceptionsFilter (HTTP/Zod/Prisma -> error envelope)
│           │   ├── pipes/             ZodValidationPipe
│           │   ├── dto/               pagination/sort/date-range/id DTOs
│           │   ├── interfaces/        paginated result, request user, api response
│           │   ├── constants/         metadata keys, tokens, header names
│           │   └── utils/             paginate, order-by builder, money helpers
│           ├── core/
│           │   ├── auth/              controllers, services, strategies (jwt access/refresh), guards, decorators, dto
│           │   ├── rbac/              @RequirePermissions, PermissionsGuard, permission cache, row-scope policies
│           │   └── health/            GET /api/v1/health (Terminus)
│           ├── database/              DatabaseModule + PrismaService (adapter-pg), tx helper
│           └── modules/<module>/      one business module each
│               ├── <module>.module.ts            e.g. plots.module.ts -> PlotsModule
│               ├── controllers/       <module>.controller.ts  (HTTP only)
│               ├── services/          <module>.service.ts     (business rules, transactions)
│               ├── repositories/      <module>.repository.ts  (only Prisma access)
│               ├── dto/               create-/update-/query DTOs bound to shared Zod schemas
│               ├── entities/          response view + mapper
│               └── interfaces/        internal contracts
│
├── packages/
│   └── shared/                        @jkbalaji/shared (tsc -> dist, ESM), imported by web + api
│       └── src/
│           ├── index.ts               barrel
│           ├── types/                 ApiResponse, Paginated, ApiError, view models
│           ├── enums/                 PlotStatus, BookingStatus, PaymentMode, ErrorCode...
│           ├── dto/                   z.infer DTO types
│           ├── schemas/               Zod schemas per module (single validation source)
│           ├── constants/             pagination defaults, API version, limits
│           ├── permissions/           permission catalog + default role matrix
│           └── utils/                 INR formatting, area conversion, money-string helpers
│
├── deploy/                            Hostinger VPS (Ubuntu 24.04), no Docker
│   ├── nginx/jkbalaji.conf            / -> :3000, /api -> :4000, gzip, headers, SSL, rate limits
│   ├── pm2/ecosystem.config.js        jkbalaji-web + jkbalaji-api, memory caps for KVM 1
│   ├── scripts/                       deploy.sh (release + symlink + migrate + health), backup-db.sh
│   └── env/                           production env templates + PostgreSQL tuning snippet
│
└── docs/
    ├── architecture/                  ARCHITECTURE.md (blueprint), FOLDER-STRUCTURE.md (this file)
    ├── api/                           API conventions + endpoint catalogue
    ├── database/                      DB conventions, relationships, migration and backup policy
    ├── deployment/                    HOSTINGER-VPS.md (sizing verdict + deployment)
    ├── modules/                       spec stub per module (+ auth)
    ├── decisions/                     ADRs 0001-0010 + template
    └── PROJECT-PLAN.md                phased plan with hour estimates
```

## Placement rules

| Question | Answer |
|----------|--------|
| Where does a new API endpoint go? | `apps/api/src/modules/<module>/controllers/`. The logic goes in `services/` and the DB access in `repositories/` |
| Where is a request/response shape defined? | `packages/shared/src/schemas/<module>.schema.ts`, used by both apps |
| Where does a new page go? | `apps/web/src/app/(dashboard)/<module>/...`, rendering components from `src/features/<module>/components` |
| Reusable UI used by 2+ modules? | `apps/web/src/components/<category>/` |
| A new env var? | `apps/<app>/.env.example`, the Zod env schema in `config/`, and `deploy/env/*.example` |
| A DB change? | `apps/api/prisma/schema.prisma`, then `npm run db:migrate:dev`, and commit the migration folder |

## Appendix: complete tree

Generated and filtered, without `.gitkeep` placeholders:

```
JKbalaji/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   │   ├── data/
│   │   │   │   ├── dev/
│   │   │   │   └── README.md
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── constants/
│   │   │   │   ├── decorators/
│   │   │   │   ├── dto/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── interfaces/
│   │   │   │   ├── pipes/
│   │   │   │   ├── utils/
│   │   │   │   └── README.md
│   │   │   ├── config/
│   │   │   │   └── README.md
│   │   │   ├── core/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── decorators/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── strategies/
│   │   │   │   ├── health/
│   │   │   │   ├── rbac/
│   │   │   │   │   ├── decorators/
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── policies/
│   │   │   │   │   └── services/
│   │   │   │   └── README.md
│   │   │   ├── database/
│   │   │   │   └── README.md
│   │   │   ├── modules/
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── bookings.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── brokers/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── brokers.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── collections/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── collections.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── customers/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── customers.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── dashboard.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── expenses/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── expenses.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── plots/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── plots.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── projects/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── projects.module.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── reports/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── README.md
│   │   │   │   │   └── reports.module.ts
│   │   │   │   ├── roles/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── README.md
│   │   │   │   │   └── roles.module.ts
│   │   │   │   ├── settings/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── interfaces/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── README.md
│   │   │   │   │   └── settings.module.ts
│   │   │   │   └── users/
│   │   │   │       ├── controllers/
│   │   │   │       ├── dto/
│   │   │   │       ├── entities/
│   │   │   │       ├── interfaces/
│   │   │   │       ├── repositories/
│   │   │   │       ├── services/
│   │   │   │       ├── README.md
│   │   │   │       └── users.module.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   │   ├── e2e/
│   │   │   ├── factories/
│   │   │   ├── fixtures/
│   │   │   ├── utils/
│   │   │   └── README.md
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   ├── README.md
│   │   ├── tsconfig.build.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── web/
│       ├── public/
│       │   └── assets/
│       │       ├── fonts/
│       │       ├── icons/
│       │       ├── images/
│       │       └── logos/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── forgot-password/
│       │   │   │   ├── login/
│       │   │   │   ├── reset-password/
│       │   │   │   └── README.md
│       │   │   ├── (dashboard)/
│       │   │   │   ├── bookings/
│       │   │   │   ├── brokers/
│       │   │   │   ├── collections/
│       │   │   │   ├── customers/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── expenses/
│       │   │   │   ├── plots/
│       │   │   │   ├── projects/
│       │   │   │   ├── reports/
│       │   │   │   ├── roles/
│       │   │   │   ├── settings/
│       │   │   │   ├── users/
│       │   │   │   └── README.md
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── charts/
│       │   │   ├── data-display/
│       │   │   ├── feedback/
│       │   │   ├── forms/
│       │   │   ├── layout/
│       │   │   ├── tables/
│       │   │   ├── ui/
│       │   │   └── README.md
│       │   ├── config/
│       │   │   └── README.md
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── bookings/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── brokers/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── collections/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── customers/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── dashboard/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── expenses/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── plots/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── projects/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── reports/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── roles/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── settings/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   ├── users/
│       │   │   │   ├── api/
│       │   │   │   ├── components/
│       │   │   │   ├── hooks/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   └── README.md
│       │   ├── hooks/
│       │   │   └── README.md
│       │   ├── lib/
│       │   │   ├── api/
│       │   │   ├── auth/
│       │   │   ├── formatters/
│       │   │   ├── utils/
│       │   │   └── README.md
│       │   ├── providers/
│       │   │   └── README.md
│       │   ├── store/
│       │   │   └── README.md
│       │   ├── styles/
│       │   │   └── globals.css
│       │   ├── types/
│       │   │   └── README.md
│       │   └── middleware.ts
│       ├── tests/
│       │   ├── e2e/
│       │   └── unit/
│       ├── .env.example
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── README.md
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── deploy/
│   ├── env/
│   │   ├── api.production.env.example
│   │   ├── postgres.tuning.conf.example
│   │   └── web.production.env.example
│   ├── nginx/
│   │   └── jkbalaji.conf
│   ├── pm2/
│   │   └── ecosystem.config.js
│   ├── scripts/
│   │   ├── backup-db.sh
│   │   ├── deploy.sh
│   │   └── README.md
│   └── README.md
├── docs/
│   ├── api/
│   │   └── API-CONVENTIONS.md
│   ├── architecture/
│   │   ├── ARCHITECTURE.md
│   │   └── FOLDER-STRUCTURE.md
│   ├── database/
│   │   └── DATABASE.md
│   ├── decisions/
│   │   ├── 0000-template.md
│   │   ├── 0001-monorepo-npm-workspaces.md
│   │   ├── 0002-nextjs-app-router-tailwind.md
│   │   ├── 0003-nestjs-layered-modular-monolith.md
│   │   ├── 0004-prisma-orm-postgresql.md
│   │   ├── 0005-jwt-httponly-cookie-auth.md
│   │   ├── 0006-rbac-permission-model.md
│   │   ├── 0007-shared-zod-contracts.md
│   │   ├── 0008-vps-nginx-pm2-no-docker.md
│   │   ├── 0009-no-ui-tokens-package-yet.md
│   │   ├── 0010-money-and-area-representation.md
│   │   └── README.md
│   ├── deployment/
│   │   └── HOSTINGER-VPS.md
│   ├── modules/
│   │   ├── auth.md
│   │   ├── bookings.md
│   │   ├── brokers.md
│   │   ├── collections.md
│   │   ├── customers.md
│   │   ├── dashboard.md
│   │   ├── expenses.md
│   │   ├── plots.md
│   │   ├── projects.md
│   │   ├── reports.md
│   │   ├── roles.md
│   │   ├── settings.md
│   │   └── users.md
│   ├── PROJECT-PLAN.md
│   └── README.md
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── constants/
│       │   ├── dto/
│       │   ├── enums/
│       │   ├── permissions/
│       │   ├── schemas/
│       │   ├── types/
│       │   ├── utils/
│       │   └── index.ts
│       ├── package.json
│       ├── README.md
│       └── tsconfig.json
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── package.json
├── README.md
└── tsconfig.base.json

274 directories, 120 files (.gitkeep placeholders not shown)
```
