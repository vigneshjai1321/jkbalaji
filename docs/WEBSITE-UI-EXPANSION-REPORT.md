# Website UI expansion — final status

**Last updated:** 2026-10-14  
**Latest commit:** _(pending deploy commit)_ — heroes, RE “Our Projects” restore, contact/branding  
**GitHub `main`:** push verified after commit (see §8)

---

## 8. Heroes, visibility, contact & branding (2026-10-14)

### Root causes

| Issue | Cause | Fix |
|-------|--------|-----|
| Section above **Flagship Layout** missing on RE home | `FeaturedProjectsSection` returned `null` when `/public/projects` was empty | Always render `ProjectsBlock` (empty-state copy when no API projects). **JK Nagar — Phases** unchanged. |
| `.reveal` content invisible on some sections | `ScrollReveal` existed but was **not mounted** in page shells; `.reveal` defaults to `opacity: 0` | Wrap main content in `ScrollReveal` on RE + JW shells; RE `prefers-reduced-motion` fallback in `globals.css`. |
| Wrong / excess Jamavisa branding | Footers, privacy, legacy `SiteFooter`, old email | Business email `tmlcheyyar@gmail.com`; phone kept `+91 99435 41435` from config; sole Jamavisa line = footer developer credit → [jamavisa.in](https://jamavisa.in). |
| Heavy dark heroes | Strong dark overlays | Light theme gradients, darker text, clearer CTAs on RE + JW heroes. |

### Affected files

- RE: `RealEstateHero.tsx`, `RealEstateHomeSections.tsx`, `RealEstatePageShell.tsx`, `RealEstateFooter.tsx`, `real-estate-business.ts`, `page.tsx` (`id="properties"`), `ContactLeadForm.tsx`, `globals.css`, privacy, legacy `SiteFooter.tsx`
- JW: `JewelleryHero.tsx`, `JewelleryPageShell.tsx`, `JewelleryFooter.tsx`, `jewellery-business.ts`, `ContactLeadForm.tsx`, privacy, legacy `SiteFooter.tsx`

### Tests & build

| Check | Result |
|-------|--------|
| `typecheck:re`, `typecheck:jew` | **PASS** |
| `build:public` | **PASS** |
| `test:api` | **NOT RUN** (no API changes) |

### Browser verification (local dev)

| Check | Result |
|-------|--------|
| RE `/` — “Our Projects” above “JK Nagar — Phases” | **PASS** |
| RE `/` — hero readable, footer email/phone/credit | **PASS** |
| JW `/` — light hero, footer email/phone/credit | **PASS** |
| JW gold rates banner (local, no API) | “Rate unavailable” — expected without local API env |
| Production jkbalaji.in / cheyyarbalaji.com | Verify after deploy (§8 deploy row) |

---

## 1. Inner-page improvements (prior release)

### Shared patterns

| Site | Components |
|------|------------|
| Real estate | `RePageHeader`, `ReInnerBand`, CTAs in `apps/real-estate-web/src/components/realestate/inner/ReInnerBlocks.tsx` |
| Jewellery | `JwPageHeader`, `JwInnerBand`, CTAs in `apps/jewellery-web/src/components/jewellery/inner/JwInnerBlocks.tsx` |
| Spacing | RE: `py-6 md:py-8` headers; JW: `.jw-section-inner` (tighter than home `.jw-section`) |
| Footers | Compact 12-column layout; **Quick links** + **Explore/Showroom** in **two-column link grids**; legal strip |

### Real estate inner routes updated

| Route | Supporting sections added |
|-------|---------------------------|
| `/about` | Services/links strip, enquire CTA bar |
| `/projects` | Buying process (compact), site-visit enquire bar |
| `/properties` | Availability note, enquire bar |
| `/properties/[slug]` | Location/contact strip; shorter hero image |
| `/jk-nagar` | Compact header; tighter enquiry block |
| `/jk-nagar/phase-*` | Breadcrumbs, compact layout; site-visit bar (phases 1–2) |
| `/gallery` | Project quick links |
| `/location` | Directions/contact strip |
| `/contact` | Enquiry guide (3 steps) |
| `/faq` | Compact FAQ + contact CTA |

Home `/` unchanged (full hero). Privacy/terms unchanged layout.

### Jewellery inner routes updated

| Route | Supporting sections added |
|-------|---------------------------|
| `/collections` | Showroom CTA bar |
| `/collections/[id]` | Other collections links, showroom bar |
| `/gold-rates` | Rates explainer (MJDTA / not shop price); compact rates panel |
| `/gold-schemes` | Scheme process note (3 steps); enquiry-only form unchanged |
| `/about` | Trust/hours strip, showroom bar |
| `/services` | Showroom contact bar |
| `/gallery` | Showroom bar |
| `/visit` | Compact header + map |
| `/contact` | Compact header + directions link |
| `/faq` | Extra FAQs (rates, making charges, scheme); contact CTA |

---

## 2. Integrations preserved

| Feature | Status |
|---------|--------|
| KJPL market rates (API) | **PASS** — not modified this UI deploy; production `provider=kjpl.in`, `isStale=false` |
| Gold scheme enquiry ₹5k–₹1L | **PASS** — API rejects invalid amount (e.g. 999 → 400); CTA **Enquire About Gold Scheme** |
| RE API listings / leads | Unchanged |
| Phase 3 interest-only | Unchanged |

**KJPL legal:** Still no verified permission from KJPL; operational risk documented — not changed in this task.

---

## 3. Git & deploy

| Step | Result |
|------|--------|
| Tests | **PASS** — `test:api` 41; `typecheck:re`, `typecheck:jew`; `build:public` |
| Commit | **PASS** — `ff487a9` |
| HTTPS push | **PASS** — `origin/main` = `ff487a9` |
| Deploy | **PASS** — `.\deploy.ps1 -BuildTargets "re,jew" -SkipDbMigrate` (no API; KJPL env untouched) |
| `typecheck:erp` / `build:api` | **NOT RUN** — no API/admin changes this release |

---

## 4. Production verification (2026-10-14)

| Check | Result |
|-------|--------|
| RE inner routes (sample) | **PASS** — HTTP 200 on `/about`, `/projects`, `/properties`, `/gallery`, `/faq` |
| JW inner routes (sample) | **PASS** — HTTP 200 on collections, gold-rates, gold-schemes, services, gallery, faq |
| Browser — `/projects` | **PASS** — buying process + compact footer (Quick links / Explore 2-col) |
| Browser — `/collections` | **PASS** — showroom CTA + compact footer |
| API health | **NOT TESTED** this pass (unchanged) |
| `/public/jewellery/market-rates` | **PASS** — KJPL, not stale |
| Full mobile/tablet matrix | **NOT TESTED** — desktop browser + HTTP only |
| Production lead submit | **NOT TESTED** — no fake leads |

---

## 5. Key files changed (`ff487a9`)

- `apps/real-estate-web/src/components/realestate/inner/ReInnerBlocks.tsx` (new)
- `apps/real-estate-web/src/components/site/RealEstateFooter.tsx`
- `apps/jewellery-web/src/components/jewellery/inner/JwInnerBlocks.tsx` (new)
- `apps/jewellery-web/src/components/jewellery/JewelleryFooter.tsx`
- All listed inner `page.tsx` files on both apps
- `apps/*/src/styles/*.css` — inner spacing helpers

---

## 6. Git backup rules

HTTPS backup documented in `.cursor/rules/20-deploy-safety.mdc`, `50-git-backup-only.mdc`, and `docs/GIT-BACKUP.md`. Remote: `https://github.com/vigneshjai1321/jkbalaji.git`.

---

## 7. Blockers / follow-ups

1. KJPL written permission — still recommended.  
2. Gold scheme — enquiry-only; business terms + payment out of scope.  
3. Optional full responsive QA pass on tablet widths.  
4. Admin CMS nav in git — deploy `admin` when staff role restrictions should go live.
