# Hostinger VPS: sizing and deployment overview

> Specs and prices were checked on **7 Oct 2026** at <https://www.hostinger.com/in/vps-hosting> (India storefront, INR).
> Cross-checked with <https://zoutons.com/news/hostinger-vps-hosting-price-india-2026>.
> Prices change often. Re-check before you buy.

## 1. Current plans (Hostinger India)

| Plan | vCPU (AMD EPYC) | RAM | NVMe | Bandwidth | Intro price* | List (struck) | Renewal |
|------|-----------------|-----|------|-----------|--------------|---------------|---------|
| **KVM 1** | 1 | 4 GB | 50 GB | 4 TB | **Rs 599/mo** | Rs 1,649/mo | Rs 999/mo |
| **KVM 2** | 2 | 8 GB | 100 GB | 8 TB | **Rs 799/mo** | Rs 2,099/mo | Rs 1,199/mo |
| KVM 4 | 4 | 16 GB | 200 GB | 16 TB | Rs 1,099/mo | Rs 3,499/mo | Rs 2,399/mo |
| KVM 8 | 8 | 32 GB | 400 GB | 32 TB | Rs 2,199/mo | Rs 6,199/mo | Rs 4,399/mo |

\* The intro price needs the full term paid upfront ("All plans are paid upfront"), and the page says "Renews at ... for 2 years".
All plans: 1 Gbps network, free weekly backups (daily backups cost extra), snapshots, firewall management, a dedicated IP, and full root access.
In-place upgrade (KVM 1 to KVM 2) is available from hPanel.

## 2. Suitability verdict: Next.js 15 + NestJS + PostgreSQL on one KVM 1

**Verdict: KVM 1 works for launch, UAT, and a small office (about 5 to 25 staff users), with conditions:**
(1) a 2 GB swap file, (2) **build elsewhere** and ship artifacts, (3) Next.js `standalone` output with one PM2 instance per app,
(4) a PostgreSQL config tuned for small memory, and (5) no headless-Chromium PDF generation on the box.
**For production with financial data, KVM 2 is the better choice.** It costs only about Rs 200/month more
(Rs 799 vs Rs 599 intro, Rs 1,199 vs Rs 999 renewal), and the second vCPU removes the main bottleneck.

### 2.1 RAM budget on KVM 1 (4 GB)

| Process | Steady RSS (estimate) | Cap / setting |
|---------|-----------------------|---------------|
| Ubuntu 24.04 + systemd/journald + sshd + fail2ban | 300-450 MB | |
| Nginx | 20-40 MB | 1 worker (`worker_processes auto` = 1 on 1 vCPU) |
| PM2 daemon (+ pm2-logrotate) | 40-70 MB | |
| Next.js 15 standalone (`jkbalaji-web`) | 150-300 MB | `--max-old-space-size=384`, `max_memory_restart 512M` |
| NestJS 12 + Prisma 7 adapter-pg (`jkbalaji-api`) | 120-250 MB | `--max-old-space-size=320`, `max_memory_restart 448M` |
| PostgreSQL 16 (shared_buffers 512 MB + ~10 backends) | 600 MB-1 GB | `max_connections 40`, Prisma pool 10 (`deploy/env/postgres.tuning.conf.example`) |
| **Total steady** | **about 1.3-2.1 GB** | leaves about 2 GB for OS page cache and report spikes |

That is comfortable for runtime. Prisma 7 has no Rust query engine, which saves roughly 50-100 MB compared with Prisma 5/6.

### 2.2 Swap

- **Yes, add a 2 GB swap file** (`fallocate -l 2G /swapfile`, `vm.swappiness=10`). It is a safety net against OOM kills during
  spikes such as large exports or `npm ci`. It is not extra capacity. If `vmstat` shows sustained `si/so` activity, it is time to upgrade.

### 2.3 Building on the server vs elsewhere

- `next build` for a 12-module app typically peaks at **1.5-3 GB RAM** and saturates the single vCPU for **several minutes**.
  `tsc` for the API adds more. On KVM 1 this slows the live app and can push PostgreSQL into swap.
- **Recommended:** build on the dev PC or in GitHub Actions (`npm ci && npm run build`), package
  `apps/web/.next/standalone` (+ `static`, `public`), `apps/api/dist`, `apps/api/prisma`, and the production `node_modules`, then upload
  and run `deploy/scripts/deploy.sh <artifact>`.
- **Fallback:** `BUILD_ON_SERVER=1` with swap enabled, ideally after office hours.
- `NEXT_PUBLIC_*` variables are inlined at build time, so the build machine needs the production values (`deploy/env/web.production.env.example`).

### 2.4 Expected capacity (1 vCPU)

- On KVM 1 the **CPU is the limit, not RAM**. A staff back-office generates little load. 25 active users clicking around produce
  roughly 1-5 requests/s. One vCPU handles light CRUD JSON at a few hundred req/s and SSR pages at tens of req/s. These are typical figures,
  not benchmarks of this app.
- **Realistic comfort zone:** about 25-50 concurrent active staff users with sub-300 ms typical responses.
- Expect occasional pauses when a heavy report, CSV/XLSX export, or `pg_dump` runs. Schedule backups for 02:30 IST.
- Use a light PDF library (pdfkit / @react-pdf/renderer) for receipts. Puppeteer/Chromium would cost 300-500 MB per render on KVM 1.

### 2.5 When to upgrade to KVM 2 (any one is enough)

- Business-hours CPU stays above 70% or load average above 1.0 for long periods, or p95 API latency goes over 500 ms.
- Used memory (excluding cache) stays above about 3 GB, or swap is actively paging.
- More than about 50 concurrent staff, **or** adding a customer or broker portal, a public SEO marketing site on the same box,
  Redis/queues, WhatsApp/SMS workers, or server-side PDF rendering.
- You want to build on the server, or run a staging copy alongside production.
- DB + uploads + local backups get close to about 35 GB of the 50 GB disk.

## 3. Target server layout

```
/var/www/jkbalaji/
  releases/<timestamp>/    immutable releases (keep 5)
  current -> releases/...  PM2 runs from here
  shared/
    api.env  web.env       production env (chmod 600)
    uploads/               KYC scans, agreements, bills (outside the web root)
    logs/                  PM2 logs (pm2-logrotate)
/var/backups/jkbalaji/     pg_dump -Fc daily, 14-day retention (+ off-site copy)
/etc/nginx/sites-available/jkbalaji.conf  (from deploy/nginx/jkbalaji.conf)
```

## 4. Deployment overview (no Docker)

1. **Provision:** Ubuntu 24.04, choose the India (or nearest) data centre, SSH keys only, create the `deploy` user, UFW allow 22/80/443,
   fail2ban, `unattended-upgrades`, 2 GB swap, timezone `Asia/Kolkata` (the DB still stores UTC).
2. **Runtime:** Node.js 22 LTS (NodeSource or nvm), `npm i -g pm2`, `pm2 install pm2-logrotate`, `pm2 startup systemd`.
3. **Database:** PostgreSQL 16 from Ubuntu repos, or 17 via PGDG. Create role `jkbalaji_app` (not superuser) and DB `jkbalaji`,
   listen on localhost only, apply `deploy/env/postgres.tuning.conf.example`, `~/.pgpass` for backups.
4. **Nginx + SSL:** copy `deploy/nginx/jkbalaji.conf`, set the domain, start with the temporary HTTP block,
   `certbot --nginx -d <domain>`, then enable the HTTPS block. `nginx -t && systemctl reload nginx`.
5. **Env:** fill `shared/api.env` and `shared/web.env` from `deploy/env/*.example`, using strong JWT secrets (`openssl rand -base64 48`).
6. **Release:** `deploy/scripts/deploy.sh <artifact.tar.gz>`. Steps: backup, unpack, link env, `prisma migrate deploy`, switch the symlink,
   `pm2 startOrReload`, health check, prune.
7. **Backups:** cron `deploy/scripts/backup-db.sh` daily, plus an rclone off-site copy. **Test a restore before go-live.** Hostinger's free
   weekly snapshot is a second layer, not the primary backup for financial data.
8. **Monitoring:** external uptime check on `/api/v1/health`, `pm2 monit`, disk alerts (above 80%), and a weekly glance at the slow-query log.

## 5. Rollback

`ln -sfn /var/www/jkbalaji/releases/<previous> /var/www/jkbalaji/current && pm2 reload all`.
Write migrations to be backward-compatible (expand, then contract) so the previous release can still run against the new schema.
If a migration must be reverted, restore from the pre-deploy dump that `deploy.sh` takes automatically.
