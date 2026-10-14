# (dashboard) route group

Authenticated back-office. `layout.tsx` here will render the app shell (sidebar, topbar, breadcrumbs)
from `src/components/layout`. Each module folder holds thin route files only:
`page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`, `loading.tsx`, `error.tsx`.
UI and logic come from `src/features/<module>`.

| Folder | URL | Module |
|--------|-----|--------|
| `dashboard/` | `/dashboard` | Role-aware KPIs: plots available/booked/sold, today's collections, overdue dues, lead funnel. |
| `projects/` | `/projects` | Layouts/ventures: name, location, survey numbers, approvals (DTCP/CMDA/RERA no.), phases/blocks, layout map. |
| `plots/` | `/plots` | Plot inventory per project: plot no., dimensions, area (sq.ft/cents/grounds), facing, rate per sq.ft, status lifecycle. |
| `customers/` | `/customers` | CRM: leads, site visits, follow-ups, customer KYC (masked), lead source, assignment to sales executives. |
| `bookings/` | `/bookings` | Plot booking/agreement: token advance, sale value, payment plan/instalment schedule, cancellation/transfer, registration status. |
| `collections/` | `/collections` | Receipts against bookings: cash/cheque/UPI/NEFT, receipt numbering, cheque clearance, dues/overdues, idempotent posting. |
| `brokers/` | `/brokers` | Channel partners/agents: profiles, commission rules, commission accruals per booking, payouts. |
| `expenses/` | `/expenses` | Project/office expenses: categories, vendor, bill attachment, approval, project-wise cost tracking. |
| `reports/` | `/reports` | Analytics & exports: sales, collections, outstanding/ageing, broker commission, project P&L, CSV/XLSX/PDF export. |
| `users/` | `/users` | Staff accounts: invite, activate/deactivate, reset password, assign roles, profile. |
| `roles/` | `/roles` | Roles & permissions: role CRUD, permission matrix (resource:action), assignment. Permission catalog is code-defined in packages/shared. |
| `settings/` | `/settings` | Company profile (JK Balaji), branding, receipt/booking number sequences, area units, tax fields, notification templates. |
