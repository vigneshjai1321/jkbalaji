# 0002. Next.js 15 App Router + Tailwind CSS v4
- Status: Accepted, 2026-10-07
## Context
The requested stack is Next.js 15. Next 16 exists, but 15.5.x is pinned as requested and still receives patches (15.5.27 at the time of writing).
## Decision
App Router with `src/` layout and `(auth)`/`(dashboard)` route groups. `output: 'standalone'` for PM2. Tailwind v4 via `@tailwindcss/postcss`, with tokens in `tailwind.config.ts` loaded by `@config`. TanStack Query, Zustand, react-hook-form + Zod.
## Consequences
+ Server Components for fast report/dashboard first paint. The standalone server keeps RAM low on the VPS.
- Plan a Next 16 upgrade (async request APIs are already the norm in 15) once the dependencies support it.
