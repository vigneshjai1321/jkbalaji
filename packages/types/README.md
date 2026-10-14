# @jkbalaji/shared

Single source of truth for contracts used by **both** `apps/web` and `apps/api`.
Built with `tsc` to `dist/` (ESM + `.d.ts`). Must be built before api/web (`npm run build:shared`).

| Folder            | Contents (planned)                                                                 |
|-------------------|------------------------------------------------------------------------------------|
| `src/types/`      | Pure TS types: `ApiResponse<T>`, `Paginated<T>`, `ApiError`, entity view models     |
| `src/enums/`      | `PlotStatus`, `BookingStatus`, `PaymentMode`, `LeadStage`, `AreaUnit`, `ErrorCode`  |
| `src/dto/`        | Inferred DTO types: `export type CreatePlotDto = z.infer<typeof createPlotSchema>`  |
| `src/schemas/`    | Zod schemas per module (`plots.schema.ts`) - validated in the browser AND the API   |
| `src/constants/`  | Permission catalog (`plots:read`...), pagination defaults, API version, limits      |
| `src/permissions/`| Permission keys + default role matrix (seeded into DB)                             |
| `src/utils/`      | Framework-free helpers: INR formatting (en-IN lakh/crore), area unit conversion, money-as-string helpers |

Rules: no React, no NestJS, no Node-only APIs - must run in browser and server. No business logic beyond pure functions.
