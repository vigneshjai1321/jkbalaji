# Website UI expansion — final status (cleanup verification)

**Last updated:** 2026-10-14  
**GitHub `main`:** verify after latest push with `git ls-remote origin refs/heads/main`

---

## 1. Git backup rules (HTTPS)

| Item | Status |
|------|--------|
| `.cursor/rules/20-deploy-safety.mdc` | **PASS** — HTTPS push; no SSH troubleshooting for backup |
| `.cursor/rules/50-git-backup-only.mdc` | **PASS** — aligned with HTTPS |
| `docs/GIT-BACKUP.md` | **PASS** — HTTPS remote, verify with `git ls-remote` |
| GitHub Actions / push deploy | **Not configured** (by design) |
| Production deploy | Unchanged: `deployment/deploy.ps1` → VPS only |

**Backup command:** `git push origin main` with `origin` = `https://github.com/vigneshjai1321/jkbalaji.git` and existing credential manager / GitHub Desktop.

---

## 2. Code changes this cleanup

| Change | Deploy needed? |
|--------|----------------|
| Git rules + `GIT-BACKUP.md` | No |
| Gold scheme CTA: **Enquire About Gold Scheme** on `/gold-schemes` only | Yes — `jew` target if not yet live |
| KJPL / rates / scheme backend | Already on production from prior deploy (`re,jew,api`) |

---

## 3. KJPL verification (production)

**Config on VPS (non-secret keys only):** `MARKET_RATES_SOURCE=kjpl`, `KJPL_RATES_ENABLED=true`, `KJPL_POLL_INTERVAL_MINUTES=15`.

| Check | Status | Evidence |
|-------|--------|----------|
| Live API valid KJPL values | **PASS** | `GET /api/v1/public/jewellery/market-rates` — `provider=kjpl.in`, `configured=true`, `schedulerEnabled=true` |
| Gold/silver with & without GST | **PASS** | e.g. gold 13590 / 13997.7, silver 245 / 252.35 (values change with KJPL; verified same on API and `/gold-rates` page) |
| Source + timestamps | **PASS** | `sourceTimestampGold`: `14-10-2026 09:38:07 am M`; `fetchedAt` ISO on API; UI “Last fetched” + KJPL page time |
| Per-gram 22K/24K shop prices | **PASS** — not shown | `price24kPerGram` null; UI MJDTA labels + disclaimer |
| Poll scheduler | **PASS** (startup) | PM2 log: `KJPL scheduler polling every 15 minutes` + initial cache at API restart |
| Second poll cycle | **NOT TESTED** | Requires waiting ≥15 minutes or log inspection over time |
| Cache key | **PASS** (design) | `kjpl_rates_cache_v1` in `app_settings` |
| Failed fetch does not overwrite cache | **PASS** (code) | `persistCache` only on successful parse; failures return error without write — **NOT TESTED** with live forced failure |
| Stale warning (>45 min) | **NOT TESTED** live | `isStale=false` while cache age &lt; 45 min; logic in `KjplService` |
| Jewellery SSR uses server API | **PASS** | `MarketRatesBanner` prefers `SERVER_API_URL`; `/gold-rates` shows KJPL blocks (not “unavailable”) |
| Browser desktop | **PASS** | KJPL source, four rate cards, disclaimers |
| Mobile nav drawer | **PASS** | Open/close menu on `/gold-rates` |
| Console / network deep audit | **NOT TESTED** | No automated console scan this session |

**KJPL permission / legal:** No verified public JSON API; `robots.txt` not reliably available (404/500 in prior checks). **No evidence KJPL granted automated access.** Business uses publicly displayed MJDTA HTML at 15-minute intervals. Residual legal/ToS risk remains — document, do not hide.

---

## 4. Gold scheme (enquiry only)

| Check | Status |
|-------|--------|
| Amount range ₹5,000–₹1,00,000 | **PASS** — UI presets + custom clamp |
| `GOLD_SCHEME_ENQUIRY` + `schemeAmountInr` | **PASS** — API |
| Reject below min / above max | **PASS** — production 400 for `1000` and `500000` |
| Missing amount on scheme lead | **PASS** — production 400 |
| No payment / enrolment / returns copy | **PASS** — page copy |
| Success only after API OK | **PASS** — `ContactLeadForm` sets `ok` only after `apiPost` succeeds |
| Duplicate submit guard | **PASS** — `submitting` disables button |
| CTA wording | **PASS** (after jew deploy) — **Enquire About Gold Scheme**; not Buy/Invest |
| End-to-end lead in admin | **NOT TESTED** — no fake production leads submitted |
| Local/unit tests | **PASS** — `public-scheme-lead.spec.ts` in `test:api` |

---

## 5. Production deployment

| Item | Status |
|------|--------|
| Last full public+API deploy | **PASS** — `re,jew,api` (build marker on VPS) |
| Deploy required for this cleanup | **Only if** gold-scheme CTA commit not yet on live `jew` |
| Admin panel | **Not redeployed** (CMS nav in git only) |

**Verify URLs:**

- `https://api.jkbalaji.in/api/v1/health` — **200**
- `https://api.jkbalaji.in/api/v1/public/jewellery/market-rates` — **200**, KJPL
- `https://cheyyarbalaji.com/gold-rates` — **200**, rates match API
- `https://cheyyarbalaji.com/gold-schemes` — **200**
- `https://jkbalaji.in/` — **200**; `/assets/images/realestate.jpg` — **200**

---

## 6. Tests & builds (this session)

| Command | Result |
|---------|--------|
| `npm run test:api` | **PASS** — 41 |
| `npm run typecheck:jew` | **PASS** |

---

## 7. Blockers / follow-ups

1. Confirm **KJPL** terms in writing when possible.  
2. **Gold scheme** — approved terms + payment still out of scope.  
3. Optional: watch PM2 logs for recurring `KJPL rates cached` every 15 minutes.  
4. Set local `git remote` to HTTPS if still on `git@github.com` (see `docs/GIT-BACKUP.md`).
