# 0009. Defer a ui-tokens package
- Status: Accepted, 2026-10-07
## Decision
No `packages/ui-tokens` or `packages/ui` for now. With one frontend, the design tokens live in `apps/web/tailwind.config.ts` and the components in `apps/web/src/components/ui`.
## Trigger to revisit
A second frontend (customer or broker portal, marketing site) needs the same brand tokens or components. Then extract `packages/ui-tokens` (Tailwind preset + CSS variables).
