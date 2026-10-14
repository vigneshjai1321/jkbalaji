# Website UI expansion — final status

**Last updated:** 2026-10-14 (final audit deploy in progress)  
**Latest commit:** _(see §11 after push)_  
**GitHub `main`:** pending this release

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
| Production [jkbalaji.in](https://jkbalaji.in/) | **PASS** — “Our Projects” + Flagship Layout; `tmlcheyyar@gmail.com`; footer credit only |
| Production [cheyyarbalaji.com](https://cheyyarbalaji.com/) | **PASS** — light hero; KJPL rates; contact + footer credit |

### Git & deploy (this release)

| Step | Result |
|------|--------|
| Commit | **PASS** — `6b52362` |
| HTTPS push | **PASS** |
| Deploy | **PASS** — `deploy.ps1 -BuildTargets re,jew -SkipDbMigrate`; PM2 `jkbalaji-realestate`, `jkbalaji-jewellery` online |
| Full tablet/mobile matrix | **NOT TESTED** — desktop browser + production home pages |

---

## 9. Developments section redesign (2026-10-14, local — not deployed)

### Scope

Premium **Our Developments & Real Estate Services** block on RE home and `/projects`: services grid, JK Nagar phase cards (public **Ongoing** badge), CTAs, and **Find the Right Property for You** enquiry block (`#property-enquiry`).

### Public vs admin status

| Layer | Behaviour |
|-------|-----------|
| Website | All JK Nagar slugs display **Ongoing** via `publicProjectStatusLabel()` / `jk-nagar-phases.ts` |
| PostgreSQL / admin | Unchanged (`ALMOST_COMPLETED`, `ONGOING`, `YET_TO_BE_ANNOUNCED` enums preserved); Phase 3 plot inventory still blocked in ERP |

### Verified / outstanding business data

| Item | Status |
|------|--------|
| Phase 1 Google Maps link | **Verified** — from user-supplied embed (`JK Nagar Phase -1`) |
| Phase 2 & 3 map pins | **Not configured** — location text only; add `mapsPlaceUrl` in `jk-nagar-phases.ts` when confirmed |
| Water / electricity / roads / drainage amenities | **Not listed** — no verified per-phase records in repo; only service-style tags (site visits, documentation) |
| DTCP / RERA badges | **Not shown** — no registration numbers verified in codebase |
| API `location` on projects | Often **null** in seed — cards use `locationLabel` from marketing config |

### Key files

- `apps/real-estate-web/src/components/realestate/developments/DevelopmentsSection.tsx`
- `apps/real-estate-web/src/components/realestate/developments/JkNagarPhaseCard.tsx`
- `apps/real-estate-web/src/components/realestate/PropertyEnquirySection.tsx`
- `apps/real-estate-web/src/lib/jk-nagar-phases.ts`, `project-display.ts`, `real-estate-services.ts`
- `apps/real-estate-web/src/components/ContactLeadForm.tsx` (`variant="property"`)
- Updated: `JkNagarPhasesSection.tsx`, `JkNagarPhasePage.tsx`, `page.tsx`, `projects/page.tsx`

### Tests (local)

| Check | Result |
|-------|--------|
| `typecheck:re` | **PASS** |
| `build:re` | **PASS** |
| Browser — home `#projects`, property form, Ongoing badges | **PASS** (localhost desktop) |
| Mobile/tablet layout | **NOT TESTED** |
| Lead POST to API | **NOT TESTED** (no fake submissions) |

### Note

Home currently shows JK Nagar cards in both **Developments** and **Flagship Layout** sections (shared `JkNagarPhaseCard`). Consider consolidating in a future pass if duplication feels heavy.

**Git / deploy:** Per task — **no commit, push, or deploy** for §9.

---

## 10. SEO & digital marketing (2026-10-14, local — not deployed)

### Approach

| Site | Domain | Shared helpers |
|------|--------|----------------|
| Real estate | `jkbalaji.in` | `apps/real-estate-web/src/lib/seo/metadata.ts`, `json-ld.ts` |
| Jewellery | `cheyyarbalaji.com` | `apps/jewellery-web/src/lib/seo/metadata.ts`, `json-ld.ts` |

- Next.js **Metadata API**: `metadataBase`, title **template**, per-route `reStaticMetadata` / `jwStaticMetadata`, dynamic `generateMetadata` for properties & collections.
- Removed unverified **DTCP-approved** wording from default RE meta; no fake reviews/ratings/offers in schema.
- **OG/Twitter**: JPEG hero assets (`realestate.jpg`, `jewels1.jpg`) instead of SVG-only previews where configured.
- **Privacy/terms**: `noIndex: true`; omitted from RE/JW sitemaps.
- **JSON-LD**: RE — `RealEstateAgent` + `WebSite` globally; `BreadcrumbList` on JK Nagar phase & property pages; `RealEstateListing` on published property detail. JW — `Organization`, `WebSite`, `JewelryStore` (hours from verified `SRI_BALAJI.hours`); `BreadcrumbList` + `Product` (no price) on collection pages.
- **Sitemaps**: RE sitemap is **async** and appends `/public/properties` slugs when API reachable at build; JW lists static routes + collection IDs.
- **robots.txt**: `allow: /`, `disallow: /api`, `host` + sitemap URL per domain.

### Verification (local)

| Check | Result |
|-------|--------|
| `typecheck:re`, `typecheck:jew`, `build:public` | **PASS** |
| `https://jkbalaji.in/sitemap.xml` (via local route after build) | **PASS** — static routes; property URLs when API returns data at sitemap generation |
| `robots.txt` (local) | **PASS** — host + sitemap |
| Full HTML meta audit on every route | **PARTIAL** — dev server stale after production build; rely on Metadata API + build output |
| Google Search Console / rich-result tests | **NOT RUN** — needs deploy + external tools |
| Production live meta | **NOT UPDATED** — changes not deployed |

### Recommended next steps (manual)

1. Deploy RE + JW when ready; verify live `<title>`, canonical, OG tags on homepage and 2–3 inner URLs.
2. Register **Google Search Console** properties for `jkbalaji.in` and `cheyyarbalaji.com`; submit sitemaps.
3. Create/claim **Google Business Profile** for JK Balaji Real Estate and Sri Balaji Thangamaligai (Cheyyar) with verified address/phone/hours.
4. Optional: [Rich Results Test](https://search.google.com/test/rich-results) on home, one JK Nagar phase, one property (if listed), JW collections/gold-rates.
5. Add verified Phase 2/3 map URLs and amenity fields to `jk-nagar-phases.ts` when business confirms (helps local SEO).

**Git / deploy:** **No commit, push, or deploy** for §10.

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
