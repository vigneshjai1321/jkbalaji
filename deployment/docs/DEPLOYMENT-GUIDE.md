# JK Balaji — Deployment Guide (PowerShell scripts)

Location: E:\JKbalaji\deployment

Files included:
- verify-server.ps1         — Verify hostname, user and IP of remote VPS
- backup-before-deploy.ps1  — Create remote tar + DB dump and optionally fetch locally
- deploy-frontend.ps1       — Deploy frontend (upload, build, pm2 restart)
- deploy-backend.ps1        — Deploy backend (upload, install, migrations, pm2 restart)
- deploy-all.ps1            — Deploy backend then frontend
- rollback.ps1              — Restore files and DB from latest remote backup
- restart-services.ps1      — Restart nginx/postgres/pm2 apps on remote
- restore-database.ps1      — Upload and restore a local DB dump to remote
- health-check.ps1          — Remote health checks for services

Prerequisites (local machine):
- PowerShell (Windows) with OpenSSH client installed (ssh/scp in PATH).
- Your SSH private key is available and loaded or provided via -KeyPath parameter.
- Local project paths: E:\JKbalaji\frontend and E:\JKbalaji\backend contain artifacts/source to deploy.

Common parameters used by scripts:
-Host (default 46.202.160.193)
-User (default root)
-Port (default 22)
-KeyPath (optional) — path to private key file for ssh/scp

Examples
--------
1) Verify server:
   .\verify-server.ps1 -Host 46.202.160.193 -User root -KeyPath C:\keys\id_ed25519

2) Create backup before deploy and fetch locally:
   .\backup-before-deploy.ps1 -Host 46.202.160.193 -User root -KeyPath C:\keys\id_ed25519 -FetchToLocal

3) Deploy backend (uploads E:\JKbalaji\backend):
   .\deploy-backend.ps1 -KeyPath C:\keys\id_ed25519 -LocalPath E:\JKbalaji\backend

4) Deploy frontend (uploads E:\JKbalaji\frontend):
   .\deploy-frontend.ps1 -KeyPath C:\keys\id_ed25519 -LocalPath E:\JKbalaji\frontend

5) Deploy all:
   .\deploy-all.ps1 -KeyPath C:\keys\id_ed25519

6) Rollback to last backup (remote):
   .\rollback.ps1 -KeyPath C:\keys\id_ed25519

7) Health check:
   .\health-check.ps1 -KeyPath C:\keys\id_ed25519

Notes & Safety
--------------
- All scripts require SSH connectivity to the production VPS. They do not modify local system configuration.
- Scripts perform remote actions via SSH; you will be prompted to confirm the server beforehand using verify-server.ps1.
- backup-before-deploy.ps1 will create backups on remote at /root/jkbalaji/backups and optionally copy them to local E:\JKbalaji\deployment\backups.
- The deploy scripts upload the local directory to a temporary remote path, swap atomically, run builds remotely and restart PM2 processes. Keep secrets out of source code; use remote environment variables or files on the VPS.
- Rollback restores from the latest remote backup tar and DB dump. Use carefully.
- These scripts do not change SSH config, firewall, or create users. They assume the remote root user has rights and required tools installed (node, npm, pm2, postgres, tar).

Recommended workflow before first deploy:
1. Run verify-server.ps1 and confirm.
2. Run backup-before-deploy.ps1 and fetch backups locally.
3. Run deploy-backend.ps1 then deploy-frontend.ps1 OR deploy-all.ps1.
4. Run health-check.ps1 and verify logs / pm2 processes.

Customization
-------------
- Edit scripts to change default remote paths, PM2 process names, or add build commands specific to your project.
- You may replace scp with rsync (over ssh) for faster incremental uploads if available.

