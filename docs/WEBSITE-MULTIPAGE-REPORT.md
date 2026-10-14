# Multi-page website upgrade — implementation report

**Date:** 2026-10-14  
**Scope:** `apps/real-estate-web`, `apps/jewellery-web`, admin/API restrictions  
**Deploy:** Not performed (awaiting your approval per project rules).

---

## 1. Route map

### Real estate (jkbalaji.in)

| Route | Status |
|-------|--------|
| `/` | Refactored — focused home with links to JK Nagar, projects, contact |
| `/about` | Enhanced with shell + imagery |
| `/projects` | **New** — API-backed project list |
| `/jk-nagar` | Updated shell |
| `/jk-nagar/phase-1` | **New** |
| `/jk-nagar/phase-2` | **New** |
| `/jk-nagar/phase-3` | **New** (register interest only; no bookings) |
| `/properties` | **New** — published listings; honest empty state |
| `/properties/[slug]` | Updated — uses `property.images[0]` when set |
| `/location` | **New** |
| `/gallery` | **New** |
| `/contact` | **New** |
| `/faq` | **New** |
| `/privacy`, `/terms` | Existing (legal chrome) |

**Navbar (5 primary):** Home · About · Projects (dropdown) · Gallery · Contact  
**CTA (not a menu item):** Enquire Now → `/contact`

### Jewellery (cheyyarbalaji.com)

| Route | Status |
|-------|--------|
| `/` | Refactored — hero, rates banner, quick links |
| `/about` | **New** |
| `/collections` | **New** |
| `/collections/[id]` | **New** — gold, silver, platinum, diamond |
| `/gold-schemes` | **New** |
| `/services` | **New** |
| `/gallery` | **New** |
| `/gold-rates` | **New** — uses existing `MarketRatesBanner` / API |
| `/visit` | **New** — map + hours |
| `/contact` | **New** |
| `/faq` | **New** |
| `/privacy`, `/terms` | Existing |

**Navbar (5 primary):** Home · About · Collections (dropdown) · Gold Rates · Contact  
**CTA:** Visit Showroom → `/visit`

---

## 2. Asset audit (mandatory)

### Repository state

**No `.jpg` / `.webp` raster files are present under either public app in git.**  
Only SVG icons exist under `public/icons/` and `favicon.svg`.

Both sites reference local paths such as:

- Real estate: `/assets/images/properties/*.jpg`, `/assets/images/banners/promotors.jpg`
- Jewellery: `/assets/images/products/*.jpg`

These paths are defined in `site-images.ts` but **the binary files are not in the workspace clone**. They may exist on the production VPS under each app’s `public/assets/` tree (not tracked in git).

| Asset path (referenced) | In git? | Intended use |
|-------------------------|---------|----------------|
| `realestate.jpg`, `plot*.jpg` | **Missing locally** | RE hero, gallery, about |
| `promotors.jpg` | **Missing locally** | RE about |
| `rings1.jpg`, `chains.jpg`, `jewels1.jpg`, etc. | **Missing locally** | JW hero, collections, gallery |

### Actions taken in code

- `SiteImage` (`next/image`) used on new/updated pages.
- Property cards **do not** use rotating stock photos as listing photos; they use `property.images[0]` from API or a text placeholder.
- Collection/gallery pages label imagery as **illustrative**.

### Required manual step before production visual QA

1. Confirm `public/assets/images/**` exists on VPS for both PM2 apps (or restore from backup).
2. Optionally add the same tree to git LFS or a documented deploy sync — **do not commit secrets**.
3. Verify each hero URL returns HTTP 200 after deploy.

---

## 3. Admin permission changes

| Layer | Change |
|-------|--------|
| **Sidebar** | `filterNavGroupsForRole()` hides Website CMS except `SUPER_ADMIN`; hides Properties/Projects/Jewellery catalogue for roles outside SUPER_ADMIN, ADMIN, REAL_ESTATE_MANAGER, GOLD_MANAGER |
| **`/cms` page** | Redirects non–super-admin to `/leads`; copy clarifies sites are source-controlled |
| **API** | `POST /admin/properties`, property PATCH/DELETE, product create/PATCH/DELETE, project PATCH in `admin-resources` now require role guards |

Leads, CRM, billing, plots (internal ERP), and gold-rate admin modules unchanged.

**Note:** `GET` list endpoints for properties/products remain available to authenticated users; only **mutations** are restricted. Tighten read access separately if required.

---

## 4. Files changed (summary)

- **Real estate:** nav, shells, home, 10+ new routes, footer, sitemap, `PropertyShowcaseCard`, `ProjectsBlock` links
- **Jewellery:** nav, shells, home, 10+ new routes, footer, sitemap
- **Admin:** `admin-nav-access.ts`, `AdminShell.tsx`, `cms/page.tsx`
- **API:** `admin.controller.ts`, `admin-resources.controller.ts`
- **Docs:** this report

---

## 5. Tests and builds

Run locally after pull:

```bash
npm run typecheck:re
npm run typecheck:jew
npm run typecheck:erp
npm run test:api
npm run build:public
```

Browser verification recommended for: 5-item nav, dropdowns, mobile drawer (Escape, scroll lock), enquiry forms, gold rates stale/unconfigured state.

---

## 6. Decisions / blockers

1. **Raster assets missing from git** — must be confirmed on server or restored before claiming “all images load.”
2. **Phase 3** — published as register-interest only (matches `jk-nagar-phases.ts`).
3. **Deploy targets** — public sites require `re,jew` (or `all`); previous deploys used `admin,api` only.
4. **GitHub push** — still blocked on SSH until your key is configured (local commits only).

---

## 7. Suggested deploy plan (after your approval)

1. Review diff and run `npm run build:public`.
2. Commit (no secrets, no `public/assets` unless you intentionally add binaries).
3. Push to GitHub when SSH works.
4. `.\deploy.ps1 -BuildTargets "re,jew"` or `"all"` as authorized — **separate from ERP-only deploys**.
5. Verify live routes, images, leads POST, and admin nav for a BILLING_STAFF / STAFF test user.
