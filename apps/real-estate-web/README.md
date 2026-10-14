# @jkbalaji/web - Next.js 15 frontend

Staff back-office for JK Balaji. App Router, TypeScript, Tailwind CSS v4, TanStack Query, Zustand,
react-hook-form + Zod (schemas from `@jkbalaji/shared`).

- `src/app/` routes only (thin): pages compose components from `src/features/<module>`.
- `src/middleware.ts` lives next to `src/app/` (required location when using `src/`).
- Production build: `output: 'standalone'`, run by PM2 as `node .next/standalone/apps/web/server.js`.

See `docs/architecture/ARCHITECTURE.md` section "Frontend" for state & data-fetching rules.
