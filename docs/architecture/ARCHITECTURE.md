# JK Balaji Real Estate Management System: Architecture Blueprint

| | |
|---|---|
| Status | Approved blueprint (structure only, no feature code yet) |
| Version | 0.1 (7 Oct 2026) |
| Scope | Staff back-office for a plot/layout developer in India (INR, Asia/Kolkata) |
| Related | [FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md), [HOSTINGER-VPS.md](../deployment/HOSTINGER-VPS.md), [PROJECT-PLAN.md](../PROJECT-PLAN.md), [ADRs](../decisions/) |

---

## 1. Goals and constraints

- **Business:** manage layouts/projects, the plot inventory, leads and customers, bookings with instalment
  plans, collections (receipts), broker commissions, expenses, and reports for JK Balaji.
- **Users:** 5 to 30 internal staff (admin, sales, accounts). A customer or broker portal may come later.
- **Non-functional:** the money figures must be correct, every financial change must be auditable, access is role-based, the system
  must run on a **single small Hostinger VPS** (Ubuntu 24.04, Nginx, PM2, no Docker), and one developer must be able to maintain it.
- **Constraints:** Windows dev machine (`E:\JKbalaji`) and Linux prod mean we use kebab-case names, LF line endings, and no OS-specific scripts in the build.

## 2. High-level architecture

```
                 Browser (staff, desktop/tablet/mobile)
                         |  HTTPS (one origin: https://example.com)
                         v
     +---------------- Nginx (TLS, gzip, security headers, rate limits) ----------------+
     |   /            -> 127.0.0.1:3000  Next.js 15 standalone (PM2: jkbalaji-web)       |
     |   /_next/static -> long-cache immutable assets                                   |
     |   /api/*       -> 127.0.0.1:4000  NestJS 12 API     (PM2: jkbalaji-api)          |
     +-----------------------------------------------------------------------------------+
                         |                                   |
        Server Components fetch API on loopback               | Prisma 7 + @prisma/adapter-pg (pool <= 10)
        (http://127.0.0.1:4000, cookies forwarded)            v
                                                     PostgreSQL 16+ (localhost only)
                                                     uploads/ on disk, pg_dump backups (local + off-site)
```

- **Modular monolith.** There is one API process with strict module boundaries. That is the right size for the team and the VPS.
  Modules talk to each other through exported services and never through another module's repository.
- **Same-origin deployment.** Web and API sit behind one domain, so we need no CORS in production, cookies can be
  `SameSite=Lax`, and the setup stays simple.
- **Contracts first.** `packages/shared` holds Zod schemas, enums, and types that both apps import, so the request and response
  shapes can't drift apart.

## 3. Key architecture decisions (summary, details in ADRs)

| # | Decision | Why |
|---|----------|-----|
| ADR-0001 | npm workspaces monorepo (`apps/web`, `apps/api`, `packages/shared`) | Atomic changes across web, API, and contracts. No extra tool (Turborepo/Nx) is needed at this size |
| ADR-0002 | Next.js 15 App Router + Tailwind CSS v4 | The user asked for this stack. Server Components help dashboard/report pages. Standalone output keeps it light on the VPS |
| ADR-0003 | NestJS 12, layered modules (controller -> service -> repository) | DI, guards, interceptors, and a clear structure for a long-lived business app. Nest 12 is ESM-only |
| ADR-0004 | **Prisma ORM 7** on PostgreSQL | See section 3.1 |
| ADR-0005 | JWT access + rotating refresh tokens in **httpOnly cookies** | Keeps tokens out of reach of XSS. Works with Server Components and middleware. A Bearer header is also accepted for a future mobile app |
| ADR-0006 | RBAC with `resource:action` permissions; roles are data, the permission catalog is code | Admins can create roles without a deploy, and developers can't typo a permission |
| ADR-0007 | Zod schemas shared across web and API (custom `ZodValidationPipe`) | One validation source. `nestjs-zod` doesn't support Nest 12 yet, and the pipe is about 30 lines |
| ADR-0008 | Hostinger VPS + Nginx + PM2, no Docker, build off-server | Fits the 1-vCPU budget. See HOSTINGER-VPS.md |
| ADR-0009 | No `packages/ui-tokens` yet | There is only one frontend, so the tokens live in `apps/web/tailwind.config.ts`. Extract them when a second UI (broker or customer portal) appears |
| ADR-0010 | Money is `Decimal(14,2)` INR and is sent over JSON as a string | No floating-point errors in financial data |

### 3.1 Why Prisma (over TypeORM, Drizzle, or Kysely)

1. **Schema-first and migrations.** `schema.prisma` is the readable source of truth for about 30 tables. `prisma migrate` generates
   versioned SQL migrations that we review in PRs and apply with `prisma migrate deploy` in the release script.
2. **Type safety end-to-end.** The generated client types every query result. Combined with shared Zod contracts, a renamed
   column breaks the build, not production.
3. **Productivity with AI assistance.** Prisma is the most widely documented TS ORM, so AI tools generate correct Prisma code reliably.
   That matters for a one-developer project.
4. **Prisma 7 fits a small VPS.** The Rust query engine is gone. Prisma 7 uses a TS client with the `pg` driver adapter, which
   lowers memory use and cold-start time and lets us control the connection pool directly (`max: 10`).
5. **Escape hatches.** `$queryRaw`/TypedSQL cover complex report SQL (ageing buckets, project P&L), and `$transaction` covers
   multi-table writes (booking + instalment schedule + commission accrual).
6. **Trade-offs we accept:** less control over SQL than Drizzle or Kysely (heavy reports may use raw SQL in repositories), and
   the generated client must be regenerated on every schema change (`npm run db:generate`, handled in CI and deploy).

## 4. Backend architecture (apps/api)

### 4.1 Layering and request flow

```
HTTP request  /api/v1/plots?projectId=..&page=1
  -> Nginx -> Nest (Express)
  -> Middleware: helmet, cookie-parser, pino-http (X-Request-Id)
  -> Guards (global, in order): ThrottlerGuard -> JwtAuthGuard (skips @Public) -> PermissionsGuard (@RequirePermissions)
  -> Interceptors (before): logging, timeout
  -> Pipes: ZodValidationPipe (body/query/params against @jkbalaji/shared schemas), ParseUUIDPipe
  -> Controller   plots.controller.ts   HTTP only: map the request to a service call, no business rules
  -> Service      plots.service.ts      business rules, row-level scope, transactions, domain events
  -> Repository   plots.repository.ts   the ONLY layer that touches PrismaService, query building, select/include
  -> PrismaService (database/) -> @prisma/adapter-pg -> PostgreSQL
  <- Entity/mapper (entities/plot.entity.ts): Prisma model -> API view (Decimal -> string, hide internal fields)
  <- ResponseEnvelopeInterceptor: { success: true, data, meta }
  <- AllExceptionsFilter (on error): { success: false, error: { code, message, details, requestId } }
```

Rules:

- A controller never imports a repository or PrismaService.
- A service may call its own repository and **other modules' services** (exported via `exports: [...]`), never their repositories.
- Multi-repository writes run inside `runInTransaction()` (Prisma interactive transaction), and the `tx` client is passed down.
- Every write on financial tables (bookings, installments, receipts, commissions, expenses) produces an `AuditLog` row
  (who, what, before/after JSON, request id), written by the service through the audit service.
- Cross-module side effects such as "booking confirmed -> plot status BOOKED + commission accrued" are synchronous in the same
  transaction. We don't run a message broker at this scale.

### 4.2 Module anatomy (naming convention)

```
src/modules/plots/
  plots.module.ts                  class PlotsModule
  controllers/plots.controller.ts  class PlotsController     @Controller({ path: 'plots', version: '1' })
  services/plots.service.ts        class PlotsService
  repositories/plots.repository.ts class PlotsRepository
  dto/create-plot.dto.ts           binds createPlotSchema (shared) for pipe + Swagger
  dto/update-plot.dto.ts
  dto/plot-query.dto.ts            filters + pagination + sort
  entities/plot.entity.ts          response view + toEntity() mapper
  interfaces/plot-filters.interface.ts
  services/plots.service.spec.ts   unit test next to the source
```

Modules: `dashboard, projects, plots, customers, bookings, collections, brokers, expenses, reports, users, roles, settings`.
Platform: `core/auth`, `core/rbac`, `core/health`. Cross-cutting: `common/*`. Config: `config/*`. Prisma: `database/`.

### 4.3 Configuration

- `ConfigModule.forRoot({ isGlobal: true, validate })` with a **Zod env schema**. The app refuses to boot on bad config.
- Namespaced configs via `registerAs('auth' | 'app' | 'database' | ...)`. No `process.env` reads outside `config/`.

## 5. Authentication flow

```
1. POST /api/v1/auth/login {email|mobile, password}
   - throttled (Nginx 10 r/min/IP + Nest throttler); account lockout after 5 failures for 15 min
   - verify argon2id hash -> issue:
       access JWT  (15 min, claims: sub, roleIds, permVersion, jti)   -> Set-Cookie jkb_at  HttpOnly; Secure; SameSite=Lax; Path=/
       refresh JWT (7 days, jti stored HASHED in refresh_tokens with family id, UA, IP) -> Set-Cookie jkb_rt HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth
   - response body: { user, permissions[] } (no tokens in JSON)
2. Each API call: JwtAccessStrategy reads jkb_at cookie (or Authorization: Bearer) -> req.user
3. 401 TOKEN_EXPIRED -> web API client calls POST /api/v1/auth/refresh once (single-flight), then retries
   - refresh ROTATION: the old jti is revoked and a new pair is issued. If a revoked jti is reused, the whole family is revoked (theft detection)
4. POST /api/v1/auth/logout -> revoke refresh family, clear cookies
5. GET /api/v1/auth/me -> current user + effective permissions (used by the web session provider)
```

- **Next.js middleware** only does *optimistic* gating (is a cookie present?) to redirect between `(auth)` and `(dashboard)`.
  The API enforces authentication and authorization.
- **Server Components** call the API on `API_INTERNAL_URL` and forward the incoming cookies.
- **CSRF:** same-origin plus `SameSite` cookies, plus Nest checks the `Origin` header on state-changing requests (and requires
  `Content-Type: application/json`).
- Password reset uses a single-use, hashed, 30-minute token sent by email or SMS (later phase). Admin-initiated reset forces a password change.

## 6. RBAC model

```
User *--* Role *--* Permission           (user_roles, role_permissions)
Permission key = "<resource>:<action>"   e.g. plots:read, plots:update, bookings:approve, bookings:cancel,
                                          collections:create, collections:void, reports:export, roles:manage
```

- **The permission catalog is code**: `packages/shared/src/permissions` is seeded and upserted on every deploy. Roles and their
  permission sets are **data** (editable in the Roles module).
- **Default roles:** `SUPER_ADMIN` (all, can't be deleted), `ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`, `ACCOUNTANT`, `VIEWER`.
- **Enforcement:** `@RequirePermissions('plots:update')` on handlers, checked by the global `PermissionsGuard`. Effective permissions =
  the union over the user's roles, cached in memory per role and invalidated when `permVersion` changes.
- **Row-level scope (data ownership)** in services through `core/rbac/policies`:
  `SALES_EXECUTIVE` sees only leads, customers, and bookings assigned to them; `SALES_MANAGER` sees their team; others see everything.
- **Frontend** uses the same keys (`can('bookings:approve')`) only to hide or disable UI. That is not security.
- **Sensitive actions** (cancel booking, void receipt, edit approved expense) need a specific permission plus a reason, and they are audit-logged.

## 7. API conventions

| Topic | Convention |
|-------|-----------|
| Base & versioning | `/api/v1/...`, Nest URI versioning (`defaultVersion: '1'`). Breaking changes go to `/api/v2` per controller |
| Resources | plural kebab-case nouns: `/projects`, `/plots`, `/bookings/:id/installments`, `/broker-commissions` |
| Methods | `GET` list/read, `POST` create, `PATCH` partial update, `DELETE` soft delete. Actions as sub-resources: `POST /bookings/:id/cancel`, `POST /receipts/:id/void` |
| IDs | UUIDv7 strings. Human numbers (`BK-2026-0001`, `RC-2026-0001`) are separate, unique, sequence-generated fields |
| JSON | camelCase fields. Dates are ISO-8601 UTC (`2026-10-07T03:21:00Z`); date-only fields are `YYYY-MM-DD`. Money is a string `"1250000.00"` (INR); area is a string in sq.ft |
| Idempotency | `Idempotency-Key` header is **required** on `POST /collections/receipts` and `POST /bookings` (stored 24 h) to prevent double receipts |
| Docs | Swagger/OpenAPI at `/api/docs` (dev; disabled or basic-auth in prod), generated from the Zod schemas |
| Health | `GET /api/v1/health` (public, no data) |

### 7.1 Response envelope

```jsonc
// success (single)
{ "success": true, "data": { "id": "0192...", "plotNo": "A-12", "status": "AVAILABLE" } }

// success (list)
{ "success": true,
  "data": [ { "...": "..." } ],
  "meta": { "page": 1, "pageSize": 20, "total": 134, "totalPages": 7, "sort": "plotNo:asc" } }

// error
{ "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed",
             "details": [ { "path": "areaSqft", "message": "Must be > 0" } ],
             "requestId": "8f2c..." } }
```

### 7.2 Pagination, filtering, sorting

- Offset pagination by default: `?page=1&pageSize=20` (pageSize max 100). The response `meta` carries the totals.
- Cursor pagination (`?cursor=...&limit=50`) for append-only, high-volume lists (audit log, notifications).
- Filters are explicit query params validated by Zod: `?projectId=..&status=AVAILABLE,BLOCKED&facing=EAST&minArea=1200`.
- Free-text search: `?q=` (ILIKE on indexed columns, `pg_trgm` later if needed).
- Sorting: `?sort=createdAt:desc,plotNo:asc`, with an allow-list of fields per resource.
- Exports: `GET /reports/<name>/export?format=csv|xlsx|pdf`, streamed, permission `reports:export`.

### 7.3 Error handling

| HTTP | `error.code` | When |
|------|--------------|------|
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHENTICATED`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS` | Auth failures |
| 403 | `FORBIDDEN` | Missing permission or outside the row-level scope |
| 404 | `NOT_FOUND` | Missing or soft-deleted resource (Prisma P2025) |
| 409 | `CONFLICT`, `PLOT_NOT_AVAILABLE`, `DUPLICATE_RECEIPT` | Unique violation (P2002), state conflicts |
| 422 | `VALIDATION_ERROR`, `BUSINESS_RULE_VIOLATION` | Zod failures, domain rules (e.g. receipt exceeds balance) |
| 429 | `RATE_LIMITED` | Throttler / Nginx |
| 500 | `INTERNAL_ERROR` | Unexpected. Message is generic, details only in logs with the `requestId` |

- Domain errors are typed classes (`PlotNotAvailableError extends DomainError`) thrown by services and mapped by `AllExceptionsFilter`.
- `ErrorCode` is an enum in `@jkbalaji/shared`, so the frontend can switch on codes and show friendly messages.
- Logs are structured JSON (pino) with `requestId`, `userId`, route, and latency. Passwords, tokens, PAN, and Aadhaar are redacted.

## 8. Naming conventions

| Item | Convention | Example |
|------|-----------|---------|
| Folders & files (all apps) | kebab-case, suffix by role | `plots.controller.ts`, `create-plot.dto.ts`, `plot-status-badge.tsx`, `use-plots.ts` |
| Nest classes | PascalCase + role suffix | `PlotsController`, `PlotsService`, `PlotsRepository`, `CreatePlotDto`, `PlotEntity` |
| React components | PascalCase export from a kebab-case file | `export function PlotStatusBadge()` in `plot-status-badge.tsx` |
| Hooks | `use` + camelCase | `usePlots`, `useCreateBooking` |
| Zod schemas | camelCase + `Schema` | `createPlotSchema`; inferred type `CreatePlotDto` |
| Enums (TS + Prisma) | PascalCase name, UPPER_SNAKE values | `PlotStatus.AVAILABLE`, `PaymentMode.UPI` |
| Constants | UPPER_SNAKE | `DEFAULT_PAGE_SIZE`, `PERMISSIONS.PLOTS_READ` |
| Prisma models | PascalCase singular | `Plot`, `BookingInstallment` |
| DB tables | snake_case plural via `@@map` | `plots`, `booking_installments`, `role_permissions` |
| DB columns | snake_case via `@map` | `plot_no`, `area_sqft`, `created_at` |
| DB indexes/constraints | `<table>_<cols>_idx`, `<table>_<cols>_key` (Prisma defaults) | `plots_project_id_status_idx` |
| Env vars | UPPER_SNAKE, domain prefix; `NEXT_PUBLIC_` only for browser-safe values | `DATABASE_URL`, `JWT_ACCESS_TTL`, `AUTH_COOKIE_SECURE`, `NEXT_PUBLIC_API_BASE_PATH` |
| API routes | `/api/v1/` + plural kebab-case | `/api/v1/broker-commissions/:id` |
| Web routes | kebab-case segments mirroring modules | `/plots`, `/plots/[id]/edit`, `/reports/collections-ageing` |
| Permissions | `resource:action` lower-case | `collections:void` |
| Git branches / commits | `feat/plots-bulk-import`; Conventional Commits | `feat(plots): add bulk CSV import` |

## 9. Frontend architecture (apps/web)

### 9.1 Structure

- `src/app/` holds routes only. `(auth)` is public, and `(dashboard)` is authenticated with the app shell layout. Each page is a thin composition
  of `src/features/<module>` components.
- `src/features/<module>/{components,hooks,api,types,schemas}` are vertical slices. Features never import other features.
- `src/components/{ui,layout,charts,tables,forms,feedback,data-display}` is the shared design system (shadcn/ui pattern on Radix,
  copied in rather than installed as a dependency).
- `src/lib/{api,auth,utils,formatters}` holds the typed fetch client, session helpers, `cn()`, and `formatINR()` (lakh/crore grouping).

### 9.2 State and data fetching

| Kind of state | Tool | Notes |
|---------------|------|-------|
| Server data (lists, details) | **TanStack Query v5** | Query keys per module (`plotsKeys.list(filters)`), `staleTime` 30 s, mutations invalidate keys, optimistic updates only for simple toggles |
| Initial page data | **Server Components** + `fetch` to `API_INTERNAL_URL` with forwarded cookies | Used for the dashboard/report first paint. Hydrated into React Query via `HydrationBoundary` where interactive |
| URL state (filters, page, sort, tab) | `searchParams` | Shareable or bookmarkable report and list views |
| Forms | **react-hook-form + Zod** (`@hookform/resolvers`) | The same shared schemas the API validates with. Server errors are mapped back onto fields via `error.details[].path` |
| UI-only global state | **Zustand** (small stores) | Sidebar, table density, layout-map selection. Never cache server data here |
| Session/permissions | `SessionProvider` (from `/auth/me`) + `can()` helper | Hides nav items and buttons |

- The **API client** (`lib/api`) has a single place for the base path, `credentials: 'include'`, envelope unwrapping, the typed `ApiError`, and
  the 401 refresh-and-retry logic. No component calls `fetch` directly.
- **Rendering:** back-office pages are dynamic (no SSG). Mutations go through the API, not Next Server Actions, which keeps one
  backend of record and makes mobile reuse possible.
- **Formatting:** `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`, dates in `Asia/Kolkata`, area units sq.ft,
  cents, grounds, and acres (conversion in `@jkbalaji/shared/utils`).
- **Accessibility and responsiveness:** keyboard-navigable tables and dialogs, tablet-friendly layout for site-office use.

## 10. Data and domain notes

- **Plot status lifecycle:** `AVAILABLE -> BLOCKED (time-boxed hold) -> BOOKED -> AGREEMENT -> REGISTERED`, plus
  `CANCELLED -> AVAILABLE` and `NOT_FOR_SALE`. Transitions happen only in `PlotsService`/`BookingsService`, with `PlotStatusHistory` rows.
- **Concurrency:** booking a plot uses `UPDATE ... WHERE status = 'AVAILABLE'` (optimistic check) inside the transaction, which prevents double booking.
- **Money:** `Decimal(14,2)`, with all arithmetic in `Prisma.Decimal` on the server. The client only formats.
- **Numbering:** `NumberSequence` table with row lock (`SELECT ... FOR UPDATE`) per financial year: `RC/2026-27/000123`.
- **KYC:** store PAN, and only the last 4 digits of Aadhaar. Document scans go in `uploads/` outside the web root, served through an authorised API stream.
- **Soft delete** (`deleted_at`) on master data. Financial records are never deleted, only voided or cancelled with a reason.
- **Time:** store UTC `timestamptz`, display in IST. Financial year runs April to March.

## 11. Security baseline

- Helmet, strict CORS (only `APP_WEB_ORIGIN` in dev; same-origin in prod), Nginx security headers, and CSP (report-only, then enforced).
- Argon2id password hashing, lockout, rate limits, refresh rotation with reuse detection.
- Zod validation on every input. Prisma parameterised queries. Raw SQL only with `Prisma.sql` tagged templates.
- Uploads: MIME and size allow-list, randomised filenames, never executed or served directly by Nginx.
- The API and DB bind to `127.0.0.1` only. UFW allows only 22/80/443. fail2ban for SSH. Automatic security updates.
- Daily DB backups plus an off-site copy. Restore drill before go-live.

## 12. Observability and operations

- pino JSON logs, written by PM2 to `logs/` and rotated with `pm2-logrotate` (10 MB x 7).
- The `/api/v1/health` endpoint is used by `deploy.sh` and by an external uptime monitor.
- Slow-query log in PostgreSQL (`log_min_duration_statement = 500ms`).
- `AuditLog` is viewable in Admin. Request id propagates from Nginx (`X-Request-Id`) through the API logs into error responses.

## 13. Testing strategy

| Level | Tooling | Target |
|-------|---------|--------|
| Unit | Vitest (+ unplugin-swc in the API) | Services (pricing, instalment schedule, commission, receipt allocation), shared utils (INR, area conversion) |
| Integration / e2e (API) | Vitest + supertest against a disposable PostgreSQL DB | Auth, RBAC denial, booking -> receipt -> outstanding flow |
| UI | Vitest + Testing Library | Form validation, permission-gated rendering |
| E2E (browser) | Playwright | Login, create booking, record receipt, export report |

Coverage goal: at least 80% on financial services, plus critical-path e2e green before every deploy.
