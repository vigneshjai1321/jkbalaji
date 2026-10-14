DOMAIN DEPLOYMENT GUIDE — jkbalaji.in
=====================================
Purpose
-------
This document describes the process and configuration artifacts required to publish the JK Balaji application to:

- Primary domain (frontend): jkbalaji.in
- API subdomain: api.jkbalaji.in
- Admin portal: admin.jkbalaji.in

Environment (unchanged by this document)
- VPS IP: 46.202.160.193
- VPS Hostname: jkbalaji.vps
- App locations on VPS (prepared earlier): /root/jkbalaji/{frontend,backend}
- PM2 process names (expected): jkbalaji-web (frontend), jkbalaji-api (api)

High-level steps (what you will do on VPS / DNS)
------------------------------------------------
1. DNS: Create A records that point your domains to the VPS IP:
   - jkbalaji.in     → 46.202.160.193
   - www.jkbalaji.in → 46.202.160.193 (optional, redirect to root)
   - api.jkbalaji.in → 46.202.160.193
   - admin.jkbalaji.in → 46.202.160.193

2. Nginx: Create server blocks for each hostname (templates provided in NGINX_PRODUCTION_TEMPLATE.conf).

3. Firewall: ensure ports 80 and 443 are open (UFW rules allow http/https).

4. SSL: Use Certbot (Let's Encrypt) to obtain certificates for the domains. Commands provided in SSL_SETUP_GUIDE.md.

5. Application: Ensure apps are running locally and listening on expected ports:
   - Frontend (jkbalaji-web) on localhost:3000 (or serve static files)
   - API (jkbalaji-api) on localhost:4000

6. Deploy Nginx site, test http -> redirect to https, test proxying to apps.

7. Harden: add security headers, HSTS, rate limits, and monitoring. See recommendations below.

Template & Files included (in this folder)
------------------------------------------
- NGINX_PRODUCTION_TEMPLATE.conf — ready-to-edit nginx server block template for frontend, api, admin
- SSL_SETUP_GUIDE.md             — certbot installation and issuance commands and tips
- env/*.example                  — environment examples (already present)

Readiness checklist (quick)
---------------------------
 - [ ] DNS A records created and propagated (TTL respected)
 - [ ] Nginx installed and enabled on VPS
 - [ ] PM2 processes (jkbalaji-web, jkbalaji-api) running and responding on localhost ports
 - [ ] UFW allows ports 80, 443
 - [ ] Certbot installed (or ready to install)
 - [ ] Backup & rollback tested (run backup-before-deploy in dry-run)

Security & production notes
--------------------------
- Use the `deploy` non-root user for running Node apps (PM2 under deploy).
- Do not store secrets in repo; place env files on VPS (chmod 600).
- After certificates issued, configure automatic renewal (certbot timer runs by default).
- Consider enabling HTTP Strict Transport Security (HSTS) after verifying SSL stability.
- Protect admin.jkbalaji.in with additional authentication (HTTP basic + strong password or SSO).
- Offsite backups recommended (S3/GCS) and encrypt DB dumps.

Rollback safety
---------------
 - Keep last working release directories (deploy scripts already create `_bak_` copies).
 - Keep at least 3 recent DB dumps and verify restore procedure on a staging VM before production.

Support & Troubleshooting
-------------------------
 - To verify nginx config: sudo nginx -t
 - To view certbot logs: sudo journalctl -u certbot -b
 - To test SSL from remote: curl -Ivk https://jkbalaji.in
 - Check PM2 logs: pm2 logs jkbalaji-web

End of guide.

