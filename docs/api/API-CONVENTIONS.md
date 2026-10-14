# API conventions (quick reference)

The authoritative version is [ARCHITECTURE.md section 7](../architecture/ARCHITECTURE.md#7-api-conventions).

- Base: `https://<domain>/api/v1`. JSON only. camelCase fields. UUIDv7 ids. Money and area are sent as strings.
- Auth: httpOnly cookies (`jkb_at`, `jkb_rt`) or `Authorization: Bearer <access>`.
- Envelope: `{ success, data, meta? }` on success, `{ success: false, error: { code, message, details?, requestId } }` on failure.
- Lists: `?page=1&pageSize=20&sort=createdAt:desc&q=...&<filters>`, returning `meta { page, pageSize, total, totalPages }`.
- Writes that create money records need an `Idempotency-Key` header.
- Swagger UI: `/api/docs` (development).

## Endpoint catalogue (filled in per module during build)

| Module | Base path | Status |
|--------|-----------|--------|
| auth | `/api/v1/auth` | planned |
| dashboard | `/api/v1/dashboard` | planned |
| projects | `/api/v1/projects` | planned |
| plots | `/api/v1/plots` | planned |
| customers | `/api/v1/customers`, `/api/v1/leads` | planned |
| bookings | `/api/v1/bookings` | planned |
| collections | `/api/v1/collections/receipts` | planned |
| brokers | `/api/v1/brokers`, `/api/v1/broker-commissions` | planned |
| expenses | `/api/v1/expenses` | planned |
| reports | `/api/v1/reports/<report-name>` | planned |
| users | `/api/v1/users` | planned |
| roles | `/api/v1/roles`, `/api/v1/permissions` | planned |
| settings | `/api/v1/settings` | planned |
| health | `/api/v1/health` | planned |
