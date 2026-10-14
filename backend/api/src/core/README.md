# core

Platform capabilities every module depends on.

## core/auth
- `controllers/auth.controller.ts` - `POST /api/v1/auth/login | refresh | logout`, `GET /api/v1/auth/me`, password reset.
- `services/auth.service.ts`, `services/token.service.ts` (sign/rotate/revoke refresh tokens, stored hashed).
- `strategies/jwt-access.strategy.ts` (cookie `jkb_at` or `Authorization: Bearer`), `strategies/jwt-refresh.strategy.ts` (cookie `jkb_rt`).
- `guards/jwt-auth.guard.ts` (global, honours `@Public()`), `guards/jwt-refresh.guard.ts`.
- `dto/` login/refresh/reset DTOs (types from `@jkbalaji/shared`).
- `auth.module.ts`

## core/rbac
- `decorators/require-permissions.decorator.ts` - `@RequirePermissions('plots:update')`.
- `guards/permissions.guard.ts` - global, runs after JwtAuthGuard; denies with 403 `FORBIDDEN`.
- `services/permission-cache.service.ts` - role -> permission set, in-memory cache invalidated on role change.
- `policies/` - row-level scope helpers (own / team / all) used by services, e.g. sales executive sees only assigned customers.
- `rbac.module.ts`

## core/health
- `health.controller.ts` - `GET /api/v1/health` (Terminus: DB ping, memory heap) used by deploy script & uptime monitor.
