# common

Cross-cutting, domain-agnostic building blocks. Nothing here may import from `modules/`.

- `decorators/` - `@CurrentUser()`, `@Public()`, `@ApiPaginated()`, `@ApiEnvelope()` - param/metadata decorators.
- `guards/` - Generic guards not tied to auth domain, e.g. `throttler-behind-proxy.guard.ts`, `idempotency.guard.ts`.
- `interceptors/` - `response-envelope.interceptor.ts` (wraps data in `{ success, data, meta }`), `logging.interceptor.ts`, `timeout.interceptor.ts`, `audit-log.interceptor.ts`.
- `filters/` - `all-exceptions.filter.ts` - maps HttpException, ZodError (422), Prisma P2002 (409) / P2025 (404) to the error envelope.
- `pipes/` - `zod-validation.pipe.ts` (validates body/query against shared Zod schemas) (Nest built-in `ParseUUIDPipe` for ids).
- `dto/` - Cross-module DTOs: `pagination-query.dto.ts`, `id-param.dto.ts`, `date-range-query.dto.ts`, `sort-query.dto.ts`.
- `interfaces/` - `paginated-result.interface.ts`, `request-user.interface.ts`, `api-response.interface.ts` (mirror shared types).
- `constants/` - Injection tokens, metadata keys (`IS_PUBLIC_KEY`, `PERMISSIONS_KEY`), header names (`X-Request-Id`, `Idempotency-Key`).
- `utils/` - Pure helpers: `paginate()`, `build-order-by.ts`, `money.ts` (Prisma.Decimal <-> string), `sequence-format.ts`.
