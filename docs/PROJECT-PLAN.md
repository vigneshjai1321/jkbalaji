# JK Balaji REMS: phased project plan

**Assumptions:** one experienced full-stack developer (Next.js/NestJS/PostgreSQL) using AI coding assistance, the scope
listed below, an available business stakeholder for quick clarifications, and English-only UI. Estimates are **focused
development hours** and include unit tests for each feature. Calendar time at about 30 productive hours a week is
roughly **8-12 weeks**.

AI assistance speeds up boilerplate (DTOs, CRUD, forms, tables) by about 30-40%. It does not shorten domain rules
(instalments, allocation, commissions), reviews, or UAT, so those are estimated conservatively.

## Phase summary

| Phase | Scope | Hours (low-high) |
|-------|-------|------------------|
| **1. Foundation** | Monorepo tooling, design system, layout shell, auth + RBAC, Prisma schema | **58-90** |
| 2. Inventory | Projects + plots | 26-40 |
| 3. CRM & sales | Customers/leads, brokers, bookings + payment plans | 44-68 |
| 4. Finance | Collections (receipts) + expenses | 30-46 |
| 5. Dashboard & reports | KPIs, analytics, exports | 26-40 |
| 6. Admin | Users, roles/permissions UI, settings, audit log | 16-26 |
| 7. Testing & hardening | e2e, security, performance, UAT fixes | 26-40 |
| 8. Deployment | Hostinger VPS, Nginx/SSL, PM2, backups, CI artifact, handover | 12-20 |
| **Total** | | **238-370 h** |

Plan with about 300 hours as the most likely figure. Add 10-15% contingency for scope changes found during UAT.

## Phase detail

### Phase 1: Foundation (58-90 h)
| Task | Hours |
|------|-------|
| Monorepo install, ESLint/Prettier, tsconfig paths, shared package build, env validation (web + API), CI lint/typecheck/test | 6-10 |
| Design system: Tailwind tokens, shadcn/ui primitives, DataTable (TanStack), form fields (INR amount, area, date), feedback states, INR/area formatters | 14-22 |
| Layout shell: sidebar with permission-filtered nav, topbar, breadcrumbs, page header, loading/error boundaries, responsive layout | 6-10 |
| API platform: main.ts wiring (helmet, pino, envelope interceptor, exception filter, Zod pipe, Swagger), health | 6-8 |
| Auth + RBAC: login/refresh/logout/me, argon2id, cookie rotation + reuse detection, lockout, guards, `@RequirePermissions`, row-scope policies, web session provider + middleware | 16-24 |
| Prisma schema for all modules, migrations, seeds (permissions, roles, admin, settings), audit-log plumbing, number sequences | 10-16 |

### Phase 2: Inventory (26-40 h)
- Projects: CRUD, approvals/RERA fields, phases/blocks, documents (10-14)
- Plots: CRUD, status lifecycle + history, price revisions, bulk CSV import with validation report, grid/"layout board" view coloured by status (16-26)

### Phase 3: CRM & sales (44-68 h)
- Customers/leads: lead capture, sources, assignment, follow-ups/site visits, lead to customer conversion, masked KYC, documents (14-22)
- Brokers: profiles, commission rules (percentage or per sq.ft) (6-10)
- Bookings: plot hold/booking with concurrency guard, sale value/discount, payment plan to instalment schedule, co-applicants,
  cancellation/transfer with refunds noted, agreement/registration status, commission accrual (24-36)

### Phase 4: Finance (30-46 h)
- Collections: receipts (cash/cheque/UPI/NEFT), allocation to instalments, cheque clearance/bounce, void with reason, idempotency,
  receipt PDF, outstanding/overdue computation (20-30)
- Expenses: categories, vendors, project linking, bill upload, approval workflow (10-16)

### Phase 5: Dashboard & reports (26-40 h)
- Role-aware dashboard KPIs and charts (8-12)
- Reports: sales register, collection register, outstanding & ageing, plot availability, broker commission, expense summary,
  project P&L, lead funnel. Filters plus CSV/XLSX/PDF export (18-28)

### Phase 6: Admin (16-26 h)
- Users (invite, activate, reset), roles and permission matrix UI, settings (company profile, sequences, units), audit-log viewer

### Phase 7: Testing & hardening (26-40 h)
- API e2e for auth/RBAC and booking to receipt to outstanding, Playwright critical paths, index/perf review with realistic data
  (about 2k plots, 10k receipts), security pass (OWASP checklist, headers, upload checks), accessibility pass, UAT bug-fix buffer

### Phase 8: Deployment (12-20 h)
- VPS hardening, Node/PM2/PostgreSQL/Nginx/Certbot, CI build artifact + `deploy.sh`, backups + off-site copy + **restore drill**,
  uptime monitoring, runbook and handover

## Out of scope (estimate separately if needed)
Customer or broker self-service portal, mobile app, payment gateway, WhatsApp/SMS automation, Tally/accounting export,
GST invoicing engine, multi-company/multi-branch, Tamil/regional-language UI, interactive SVG layout map editor.

## Milestones
1. M1 (end of Phase 1): login, roles, and an empty app shell deployed to a staging subdomain.
2. M2 (Phases 2-3): inventory + CRM + bookings usable by the sales team (UAT round 1).
3. M3 (Phases 4-5): collections, expenses, and reports (UAT round 2 with accounts).
4. M4 (Phases 6-8): go-live on the Hostinger VPS after the backup restore drill.
