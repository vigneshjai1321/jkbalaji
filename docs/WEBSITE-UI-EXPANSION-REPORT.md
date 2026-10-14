# Website UI expansion, gold scheme & KJPL rates — final report

**Date:** 2026-10-14  
**Scope:** `apps/real-estate-web`, `apps/jewellery-web`, `backend/api` (market rates + leads), `apps/admin-panel` (CMS nav access)  
**Local commit:** `2cb90c7` — *feat: expand public websites, gold scheme enquiries, and market rates*

---

## A. Deployment status

| Step | Status | Evidence |
|------|--------|----------|
| Local tests & builds | **PASS** | See § D |
| Git commit | **PASS** | `2cb90c7` on `main` |
| GitHub push (`origin main`) | **BLOCKED** | `git@github.com: Permission denied (publickey)` — tried default SSH, `id_ed25519_github`, `id_ed25519_jamavisa` |
| Production deploy | **BLOCKED** | Per `.cursor/rules/20-deploy-safety.mdc` — deploy **not** run because remote backup was not verified |
| VPS SSH (deploy path) | **PASS** | `ssh root@46.202.160.193` with `id_ed25519` returned `ok` (deploy script would reach server once push succeeds) |

**Intended deploy (after successful push):**

```powershell
cd E:\JKbalaji\deployment
.\deploy.ps1 -BuildTargets "re,jew,api" -SkipDbMigrate
```

- **Why include `api`:** Gold scheme amount validation, `GET /public/jewellery/market-rates`, unpublished property slug 404, and KJPL module live in the API — public sites alone are insufficient.
- **Why not `admin`:** CMS nav restrictions are in the commit for backup; no requirement to restart admin for public launch (redeploy admin when convenient).
- **KJPL on production:** Code ships with KJPL **disabled by default** (`MARKET_RATES_SOURCE=goldapi`). Do **not** set `KJPL_RATES_ENABLED=true` / `MARKET_RATES_SOURCE=kjpl` until business/legal approval. Existing VPS `.env` is preserved by `vps-install.sh`.

**Production verification (current live build — pre-deploy):**

| Site | `/`, `/about` | New routes (`/projects`, `/properties`, …) |
|------|---------------|---------------------------------------------|
| jkbalaji.in | HTTP **200** | HTTP **404** (not deployed yet) |
| cheyyarbalaji.com | HTTP **200** | HTTP **404** (not deployed yet) |
| api.jkbalaji.in `/api/v1/health` | HTTP **200** | `GET /api/v1/public/jewellery/market-rates` → **404** (old API) |

**Next action for you:** Fix GitHub SSH (add deploy key or `ssh-agent` + correct key), then:

```powershell
git push origin main
git fetch origin
git log origin/main -1   # must show 2cb90c7 (or later doc commit)
cd E:\JKbalaji\deployment
.\deploy.ps1 -BuildTargets "re,jew,api" -SkipDbMigrate
```

---

## B. Website features — routes and sections

### Real estate (jkbalaji.in) — verified locally (`next start` port 3010)

| Route | Sections / behaviour verified |
|-------|-------------------------------|
| `/` | Hero, featured projects (API), JK Nagar phases (P3 register-interest), listings strip, why choose, buying process, location/map, site visit form, FAQ teaser, calculator |
| `/about`, `/jk-nagar`, `/jk-nagar/phase-1|2|3` | Phase pages; P3 interest-only |
| `/projects`, `/properties` | API listings; filters (location + max budget) when data exists; honest empty state |
| `/properties/[slug]` | Published API data; 404 rules on API (see § C) |
| `/gallery`, `/location`, `/contact`, `/faq` | Content + CTAs |
| Nav | Five primary items + separate **Enquire Now** |

**Not added:** Fake testimonials or unverified approvals.

### Jewellery (cheyyarbalaji.com) — verified locally (port 3011)

| Route | Sections / behaviour verified |
|-------|-------------------------------|
| `/` | Hero, rates banner (unavailable until API + env), collections preview (illustrative), scheme promo, why choose, showroom, FAQ teaser |
| `/about`, `/collections`, `/collections/[id]`, `/services`, `/gallery`, `/visit`, `/contact`, `/faq` | Premium layout; illustrative labels where no inventory API |
| `/gold-rates` | `MarketRatesPanel` — provider, stale, unavailable |
| `/gold-schemes` | Amount presets ₹5k–₹1L + custom; enquiry-only copy |
| Nav | Five primary items + **Visit Showroom** CTA |

---

## C. How everything works

### Real estate — projects and properties

- Server components call `GET /api/v1/public/...` (via `NEXT_PUBLIC_API_URL` / `SERVER_API_URL`) for published projects and properties.
- Cards use the first uploaded image URL from the API when present; otherwise a neutral placeholder (no stock plot photos).
- **Site visit / enquiry:** `ContactLeadForm` → `POST /api/v1/public/leads` with `leadType` (e.g. `SITE_VISIT`), site `REAL_ESTATE`, optional `projectSlug` / `propertyId`.
- **Unpublished slug:** `GET /public/properties/:slug` returns **404** if not published or blocklisted.

### Jewellery — gold scheme enquiry

- User selects preset or custom amount (₹5,000–₹1,00,000) on `/gold-schemes`.
- Form posts `leadType: GOLD_SCHEME_ENQUIRY`, `site: JEWELLERY`, `schemeAmountInr`.
- API requires amount for that lead type; validates range; appends `Preferred scheme contribution: ₹…` to the lead message.
- **No** online payment, enrolment reference, or “paid” status without a verified payment provider and approved terms.

### Market rates (GoldAPI vs KJPL)

- Frontend reads **`GET /api/v1/public/jewellery/market-rates`** only (no secrets in browser).
- `MarketRatesService` uses `MARKET_RATES_SOURCE` (`goldapi` default | `kjpl`).
- **KJPL:** Backend fetches public HTML from kjpl.in, parses MJDTA with/without GST, caches in Prisma `app_settings` key `kjpl_rates_cache_v1`; poll when `KJPL_RATES_ENABLED=true`; stale after 45 minutes; failed fetch does **not** overwrite valid cache.
- UI shows source name, last update, unavailable/stale states; disclaimer that reference rate ≠ final shop price.
- Admin: `GET/POST /api/v1/admin/kjpl-rates/status|refresh` (SUPER_ADMIN, ADMIN, GOLD_MANAGER).

### Admin

- Leads (site visit, scheme enquiry) appear in existing lead management after API deploy.
- CMS nav access helper restricts Website CMS by role (commit included; admin redeploy optional).

---

## D. Test status

| Check | Result |
|-------|--------|
| `npm run test:api` | **PASS** — 41 tests (incl. `kjpl-parse.spec.ts`, `public-scheme-lead.spec.ts`) |
| `npm run test -w @jkbalaji/admin-panel` | **PASS** — 2 tests |
| `npm run typecheck:erp` | **PASS** |
| `npm run typecheck:re` | **PASS** |
| `npm run typecheck:jew` | **PASS** |
| `npm run build:public` | **PASS** — RE 21 routes, JW 17 routes |
| `npm run build:api` | **PASS** |
| `scripts/verify-public-site-images.mjs` (3010/3011) | **PASS** — 12 JPGs HTTP 200 + disk |
| Browser — RE home, properties, JW home, gold-schemes | **PASS** (local production `next start`) |
| Browser — production new routes | **NOT TESTED** — deploy blocked |
| Production form → leads | **NOT TESTED** — no fake production leads; API endpoint not on live yet |
| KJPL live polling on VPS | **NOT TESTED** — not enabled; legal gate |
| Admin role regression on production | **NOT TESTED** — admin not redeployed |

---

## E. Gold scheme — rules implemented

| Rule | Status |
|------|--------|
| Amounts ₹5,000–₹1,00,000 | UI + API |
| Enquiry only | **PASS** — no payment gateway |
| No invented returns/bonus/maturity | Copy + report |
| Approved plan terms / calculator / enrolment DB | **Awaiting business** |
| Admin scheme settings UI | **Not built** |

---

## F. KJPL.in — feasibility

| Item | Status |
|------|--------|
| Official JSON API | **Not found** |
| Backend HTML parse (MJDTA) | **PASS** in unit tests; live parse verified in prior session |
| Production enablement | **BLOCKED** — confirm KJPL terms/robots before `KJPL_RATES_ENABLED=true` |
| Rollback | Keep `MARKET_RATES_SOURCE=goldapi` on VPS until approved |

---

## G. Remaining blockers

1. **GitHub SSH** — must succeed before deploy (`Permission denied (publickey)`).
2. **Production deploy** — run `deploy.ps1 -BuildTargets "re,jew,api" -SkipDbMigrate` after push verified.
3. **Post-deploy smoke** — HTTPS routes listed in Phase 11 of deployment brief; re-run image script against live origins.
4. **KJPL legal approval** before switching production env.
5. **Gold scheme business terms** before payment/enrolment/calculator.
6. **Testimonials** — omitted until verified content exists.

---

## H. Key files (reference)

- `backend/api/src/modules/kjpl/`, `backend/api/src/modules/market-rates/`
- `apps/real-estate-web/src/components/realestate/RealEstateHomeSections.tsx`
- `apps/real-estate-web/src/components/public/PropertyListingWithFilters.tsx`
- `apps/jewellery-web/src/components/jewellery/GoldSchemeEnquiry.tsx`
- `apps/jewellery-web/src/components/jewellery/MarketRatesPanel.tsx`
- `scripts/verify-public-site-images.mjs`
- `docs/WEBSITE-MULTIPAGE-REPORT.md` (earlier multipage notes)
