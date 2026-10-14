# components

Shared, module-agnostic UI. Files are kebab-case (`status-badge.tsx`) exporting PascalCase components.
Nothing here may import from `src/features/*`.

- `ui/` - Design-system primitives (shadcn/ui pattern on Radix): button, input, select, dialog, sheet, badge, card, tabs, tooltip.
- `layout/` - App shell: sidebar (permission-filtered nav), topbar, breadcrumbs, page-header, container.
- `charts/` - Recharts wrappers with brand theme: kpi-sparkline, bar/line/donut charts for reports & dashboard.
- `tables/` - TanStack Table v8 wrapper: data-table, column-header, pagination, toolbar, row-actions, export button.
- `forms/` - react-hook-form + Zod field components: form-field, inr-amount-input, area-input, date-picker, file-upload.
- `feedback/` - Loading/empty/error states, skeletons, toasts (sonner), confirm-dialog, permission-denied.
- `data-display/` - Read-only display: stat-card, status-badge (plot/booking status), inr-amount, key-value list, timeline.
