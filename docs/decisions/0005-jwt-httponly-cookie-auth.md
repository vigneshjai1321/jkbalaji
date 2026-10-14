# 0005. JWT access + rotating refresh tokens in httpOnly cookies
- Status: Accepted, 2026-10-07
## Decision
15-minute access JWT (`jkb_at`) and 7-day refresh JWT (`jkb_rt`, path-scoped to `/api/v1/auth`), both HttpOnly + Secure. Refresh tokens are stored hashed, rotate on every use, and reuse revokes the token family. A Bearer header is also accepted for future mobile clients.
## Consequences
+ No tokens in JS, which mitigates XSS token theft. Works with Next middleware and Server Components (cookie forwarding).
- Needs CSRF care: SameSite plus Origin check plus JSON-only mutations.
