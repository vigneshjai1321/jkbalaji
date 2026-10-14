# features

One folder per business module (vertical slice). Each contains:

| Sub-folder    | Purpose                                                                                   |
|---------------|-------------------------------------------------------------------------------------------|
| `components/` | Module UI: `plots-table.tsx`, `plot-form.tsx`, `plot-status-badge.tsx`                    |
| `hooks/`      | TanStack Query hooks: `use-plots.ts`, `use-create-plot.ts` (query keys in `plots.keys.ts`) |
| `api/`        | Typed endpoint functions using `src/lib/api`: `plots.api.ts`                              |
| `types/`      | UI-only types (view models). API contracts come from `@jkbalaji/shared`                   |
| `schemas/`    | Form schemas - re-export/extend shared Zod schemas: `plot-form.schema.ts`                 |

Rule: features may import from `components/`, `lib/`, `hooks/`, `@jkbalaji/shared`; never from another feature
(cross-module needs go through shared components or the API).
