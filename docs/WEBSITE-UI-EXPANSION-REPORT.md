# Website UI expansion, gold scheme & KJPL rates — report

**Date:** 2026-10-14  
**Scope:** `apps/real-estate-web`, `apps/jewellery-web`, `backend/api` (market rates + leads)  
**Git / deploy:** Local work only — no commit, push, or deploy in this task.

---

## 1. Sections and routes added or expanded

### Real estate (jkbalaji.in)

| Area | Change |
|------|--------|
| **Home `/`** | Featured API projects (`ProjectsBlock`), JK Nagar phase cards, listings strip, Why Choose, buying process, location/map, site-visit lead form (`SITE_VISIT`), FAQ teaser, calculator retained |
| **Properties `/properties`** | Client filters: location + max budget (from published API data) |
| **Existing routes** | Unchanged 5-item nav; Phase 3 remains register-interest only via `jk-nagar-phases.ts` |

**Not added (by design):** Generic testimonial carousel (no verified review database). No fake approvals or customer names.

### Jewellery (cheyyarbalaji.com)

| Area | Change |
|------|--------|
| **Home `/`** | Collections preview, gold scheme promo, why choose, showroom strip, FAQ teaser; rates banner + hero retained |
| **`/gold-schemes`** | Amount selector ₹5,000–₹1,00,000 (presets + custom), enquiry form → `GOLD_SCHEME_ENQUIRY` lead with server-validated amount |
| **`/gold-rates`** | Uses shared `MarketRatesPanel` (GoldAPI or KJPL layout) |
| **Nav** | Still 5 primary items + Visit Showroom CTA |

---

## 2. Gold savings scheme — rules implemented

| Rule | Status |
|------|--------|
| Selectable amounts ₹5,000–₹1,00,000 | UI + API validation on `schemeAmountInr` |
| Enquiry only (no online payment / enrolment) | Implemented — no payment gateway wired |
| No invented returns, bonuses, or maturity promises | Copy states terms confirmed in showroom |
| Approved plan terms / calculator | **Awaiting business** — no DB fields for duration, frequency, redemption |
| Backend | `POST /public/leads` requires amount for `GOLD_SCHEME_ENQUIRY`; appends amount to message |
| Admin enrolment UI | **Not added** — `JewelleryScheme` model is title/description only; no enrolment table |

---

## 3. KJPL.in fetching — feasibility and verification

| Finding | Detail |
|---------|--------|
| **Official API** | No documented public JSON API found; site uses HTML + Socket.IO for live trading UI |
| **Permitted approach used** | Backend **HTML fetch** of public homepage (`https://kjpl.in/`), parse **MJDTA RATE (Without/With GST)** blocks |
| **Live parse verified (2026-10-14)** | Gold without GST **13685**, silver **245**, with GST **14095.55** / **252.35**, updated text present |
| **Unit** | Displayed as on KJPL (MJDTA reference — **not** auto-converted to per-gram 24K); disclaimer on site |
| **Compliance** | No auth bypass; User-Agent identifies bot; **confirm with KJPL/terms** before enabling in production |
| **Implementation** | `backend/api/src/modules/kjpl/*`, cache in `app_settings` key `kjpl_rates_cache_v1`, poll when `KJPL_RATES_ENABLED=true` |
| **Source selection** | `MARKET_RATES_SOURCE=goldapi` (default) or `kjpl` via `MarketRatesService` — providers not mixed in one response |
| **Failure behaviour** | Failed fetch does **not** overwrite cache; stale warning after 45 minutes |

**Configure (server `.env` only):**

```env
MARKET_RATES_SOURCE=kjpl
KJPL_RATES_ENABLED=true
KJPL_POLL_INTERVAL_MINUTES=15
```

Admin: `GET/POST /api/v1/admin/kjpl-rates/status|refresh` (SUPER_ADMIN, ADMIN, GOLD_MANAGER).

---

## 4. Test and build results (this session)

| Check | Result |
|-------|--------|
| `npm run test:api` | **41 passed** (includes `kjpl-parse.spec.ts`, `public-scheme-lead.spec.ts`) |
| `npm run typecheck:erp` | **Pass** |
| `npm run typecheck:re` / `typecheck:jew` | **Pass** (during full build pipeline) |
| `npm run build:public` | **Pass** — RE 21 routes, JW 17 routes |

**Not run in this session:** Browser desktop/mobile pass on every new section; live API with KJPL enabled end-to-end; staff-role admin UI regression.

---

## 5. Security / API

- `GET /public/properties/:slug` now returns **404** for unpublished or blocklisted slugs.
- Market rates still **backend-only** fetch; no secrets in frontend.
- Scheme amount validated server-side; **no** “paid” state without payment provider.

---

## 6. Remaining issues and configuration

1. **Business approval:** Gold scheme legal terms, duration, payment frequency, redemption — then optional admin fields + payment integration.
2. **KJPL legal review** before production polling; consider rate limits and written permission.
3. **GoldAPI vs KJPL:** Choose one `MARKET_RATES_SOURCE` for production; label provider clearly (UI done).
4. **Plot/project filters:** Budget/location only — no plot-size filter (not in public API payload).
5. **Testimonials / reviews:** Omitted until verified content exists.
6. **Images:** Prior flat `public/assets/images/*` work preserved; not re-verified in browser this session.

---

## 7. Key new files (reference)

- `backend/api/src/modules/kjpl/`
- `backend/api/src/modules/market-rates/`
- `apps/real-estate-web/src/components/realestate/RealEstateHomeSections.tsx`
- `apps/real-estate-web/src/components/public/PropertyListingWithFilters.tsx`
- `apps/jewellery-web/src/components/jewellery/GoldSchemeEnquiry.tsx`
- `apps/jewellery-web/src/components/jewellery/JewelleryHomeSections.tsx`
- `apps/jewellery-web/src/components/jewellery/MarketRatesPanel.tsx`
