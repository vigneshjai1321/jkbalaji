# Website UI expansion, gold scheme & KJPL rates — final report

**Last updated:** 2026-10-14  
**Production deploy commits:** `2cb90c7` (feature), `58fa52c` (report), `48cfa42` (jewellery SSR rates fix + deploy script)  
**GitHub `origin/main` verified:** `48cfa42d304920e98dd9b90ec6403ab224ffeca6`

---

## A. Deployment status

| Step | Status | Detail |
|------|--------|--------|
| Tests & builds (pre-deploy) | **PASS** | `test:api` 41/41; `typecheck:erp/re/jew`; `build:public`; `build:api` |
| Git commits | **PASS** | See commits above; working tree clean after `48cfa42` |
| GitHub push | **PASS** | SSH `git@github.com` still **FAIL** (`Permission denied (publickey)`). Push succeeded via **HTTPS** + Windows credential manager: `git push https://github.com/vigneshjai1321/jkbalaji.git main`. Remote verified with `git ls-remote`. |
| Deploy #1 | **PASS*** | `.\deploy.ps1 -BuildTargets "re,jew,api" -SkipDbMigrate` — VPS install **OK** (`last-deploy-build.ok`, PM2 restarted). Script exit **1** because certbot “certificate not due for renewal” was treated as failure; `verify-deploy.sh` **not** run by script. Manual verify: **PASS**. |
| Deploy #2 | **PASS** | `.\deploy.ps1 -BuildTargets "jew" -SkipDbMigrate` after SSR fix — exit **0**, verification **PASS**. |
| KJPL env on VPS | **PASS** | Set on server only: `MARKET_RATES_SOURCE=kjpl`, `KJPL_RATES_ENABLED=true`, `KJPL_POLL_INTERVAL_MINUTES=15`; `pm2 restart jkbalaji-api`. |

\*First deploy: application rollout succeeded; automation exit code misleading until `deploy.ps1` SSL step was relaxed in `48cfa42`.

**Commands used:**

```powershell
cd E:\JKbalaji\deployment
.\deploy.ps1 -BuildTargets "re,jew,api" -SkipDbMigrate
# later:
.\deploy.ps1 -BuildTargets "jew" -SkipDbMigrate
```

**PM2 (post-deploy):** `jkbalaji-api`, `jkbalaji-realestate`, `jkbalaji-jewellery` **online**; `jkbalaji-admin` unchanged (not redeployed).

**Infrastructure:** PostgreSQL `pg_isready` **PASS**; nginx **active**.

---

## B. KJPL rate source

| Item | Status |
|------|--------|
| KJPL `robots.txt` | **NOT FOUND** — `https://kjpl.in/robots.txt` → 404; `https://www.kjpl.in/robots.txt` → 500 |
| Written permission from KJPL | **NOT ESTABLISHED** — your project authorization does not replace third-party terms |
| Production enablement | **ENABLED** — public homepage MJDTA values parsed server-side; 15‑minute poll; cache in `app_settings` (`kjpl_rates_cache_v1`) |
| Rationale | Business chose KJPL as reference source; rates are publicly displayed on kjpl.in; moderate polling; no credentials in frontend. **Recommend** formal confirmation with KJPL when possible. |
| Units / disclaimer | **PASS** — UI shows **MJDTA** with/without GST; not sold as per‑gram 22K/24K shop prices |

**Live API sample (2026-10-14):** `provider=kjpl.in`, `goldWithoutGstInr=13590`, `silverWithoutGstInr=245`, `isStale=false`, `schedulerEnabled=true`.

---

## C. Production verification

### HTTPS routes

**jkbalaji.in** — all **200:** `/`, `/about`, `/projects`, `/properties`, `/gallery`, `/location`, `/contact`, `/faq`, `/jk-nagar/phase-1`, `/phase-2`, `/phase-3`.

**cheyyarbalaji.com** — all **200:** `/`, `/about`, `/collections`, `/gold-schemes`, `/services`, `/gallery`, `/gold-rates`, `/visit`, `/contact`, `/faq`.

### API

| Check | Result |
|-------|--------|
| `GET /api/v1/health` | **PASS** — 200 |
| `GET /api/v1/public/jewellery/market-rates` | **PASS** — KJPL payload |
| Gold scheme validation | **PASS** — `schemeAmountInr: 1000` → **400** with range message (no lead created) |

### Images

| Asset | Result |
|-------|--------|
| `https://jkbalaji.in/assets/images/realestate.jpg` | **PASS** — 200 |
| `https://cheyyarbalaji.com/assets/images/rings1.jpg` | **PASS** — 200 |

### Browser

| Page | Result |
|------|--------|
| `https://cheyyarbalaji.com/gold-rates` | **PASS** — KJPL source, MJDTA gold/silver excl/incl GST, disclaimer |
| Local full regression (all sections) | **NOT TESTED** on production mobile drawer |

**Not tested:** Production lead form success path (avoid fake customer leads); admin panel regression (admin not redeployed).

---

## D. How features work (summary)

- **Real estate:** Published projects/properties from API; site visit via `POST /public/leads`; Phase 3 register-interest only.
- **Gold scheme:** Enquiry only; amount ₹5k–₹1L validated on API; no online payment.
- **Rates:** API fetches KJPL HTML; jewellery site SSR uses `SERVER_API_URL` (localhost) to read rates; banner shows source, timestamps, stale warning when applicable.

---

## E. Test / build results (this session)

| Check | Result |
|-------|--------|
| `npm run test:api` | **PASS** — 41 |
| `npm run typecheck:erp` / `re` / `jew` | **PASS** |
| `npm run build:public` / `build:api` / `build:jew` | **PASS** |
| `verify-deploy.sh` (manual after deploy #1) | **PASS** |
| Deploy script verify (deploy #2) | **PASS** |

---

## F. Remaining blockers / follow-ups

1. **GitHub SSH** — `origin` still `git@github.com:...`; use HTTPS push or add `id_ed25519_github` to GitHub account for SSH.
2. **KJPL legal** — obtain/clarify terms when possible; monitor for HTML layout changes.
3. **Gold scheme** — business-approved terms, enrolment DB, payment provider still **NOT IMPLEMENTED**.
4. **Admin CMS nav** — in git (`2cb90c7`); deploy `admin` when staff should see role-based CMS restrictions live.
5. **Certbot exit code** — deploy #1 false failure; mitigated in `48cfa42` (continue to verification).

---

## G. Key files

- `backend/api/src/modules/kjpl/`, `market-rates/`
- `apps/jewellery-web/src/components/jewellery/MarketRatesBanner.tsx` (SSR → `SERVER_API_URL`)
- `deployment/deploy.ps1`
- `scripts/verify-public-site-images.mjs`
