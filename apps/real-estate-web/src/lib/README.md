# lib

Framework-light infrastructure for the frontend.

- `api/` - typed fetch client: base path `/api/v1`, `credentials: 'include'`, envelope unwrapping,
  `ApiError` normalisation, single-flight 401 -> `/auth/refresh` -> retry once. Server-side variant forwards cookies to `API_INTERNAL_URL`.
- `auth/` - session helpers (`getSession()` for Server Components), permission check `can(user, 'plots:update')`.
- `utils/` - `cn()` (clsx + tailwind-merge), query-string builders, download helpers.
- `formatters/` - `formatINR()` (en-IN lakh/crore grouping, Rs symbol), area (sq.ft / cents / grounds / acres), dates in Asia/Kolkata.
