# Database: PostgreSQL 16+ with Prisma ORM 7

## Conventions
- Models are PascalCase singular. Tables are snake_case plural (`@@map`). Columns are snake_case (`@map`).
- PK `id` is UUIDv7 (`@default(uuid(7)) @db.Uuid`). Human-readable numbers (booking/receipt) are separate unique columns.
- `created_at`, `updated_at` (timestamptz, UTC), `deleted_at` (soft delete on master data), `created_by_id`, `updated_by_id`.
- Money is `Decimal(14,2)` INR and area is `Decimal(12,2)` sq.ft. Never use Float.
- Enums are Prisma enums in UPPER_SNAKE, mirrored in `@jkbalaji/shared/enums`.
- Index every FK plus common filter combinations (e.g. `plots(project_id, status)`, `installments(due_date, status)`).
- Financial rows are never hard-deleted. Use void/cancel with `reason`, `voided_by_id`, `voided_at`.

## Planned entity groups
See the comment block in `apps/api/prisma/schema.prisma`: identity & access, projects & inventory, CRM, sales,
collections, channel partners, expenses, system (settings, number sequences, attachments, audit log).

## Key relationships (planned)
```
Project 1-* ProjectPhase 1-* Plot
Customer 1-* Booking *-1 Plot          (one active booking per plot, enforced in service + partial unique index)
Booking 1-* Installment 1-* ReceiptAllocation *-1 Receipt *-1 Customer
Booking *-1 Broker ; Booking 1-* Commission 1-* CommissionPayout
Expense *-1 ExpenseCategory ; Expense *-0..1 Project
User *-* Role *-* Permission ; AuditLog *-1 User
```

## Migrations
- Develop with `npm run db:migrate:dev` (creates SQL in `apps/api/prisma/migrations/`). Review the SQL in the PR.
- Production runs `prisma migrate deploy` inside `deploy/scripts/deploy.sh` **after** an automatic `pg_dump`.
- Expand-then-contract for breaking changes, so the previous release keeps working during rollback.

## Backups
`deploy/scripts/backup-db.sh`: daily `pg_dump -Fc`, 14-day local retention, off-site copy, monthly restore test.
