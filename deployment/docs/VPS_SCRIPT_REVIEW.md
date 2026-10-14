VPS Script Review — prepare-jkbalaji.sh
=======================================
Date: 2026-10-07
Reviewer: automated technical review (manual follow-up recommended)

Scope
-----
Review of the VPS preparation script provided for the JK Balaji project.
Script intent: prepare a brand new Ubuntu VPS (hostname: jkbalaji.vps, IP: 46.202.160.193)
by installing Node.js 22 LTS, PM2, Nginx, PostgreSQL, UFW, Fail2ban, rsync and creating
the /root/jkbalaji directory structure. Script also configures PM2 startup and writes a report.

Important: this review is purely static / technical. The script must NOT be executed as part
of this review. The reviewer checked logic, commands and recommended production best-practices.

Summary Assessment (one line)
-----------------------------
The script provides a quick, functional bootstrap for a fresh test VPS, but requires several
important security and operational improvements before being used in production. Score: 72/100.

Overall score rationale
- The script correctly installs required packages and enables services (nginx/postgres/fail2ban).
- It uses NodeSource to install Node 22 (acceptable for Ubuntu).
- It configures PM2 startup, but for the root user (not recommended).
- Missing: least-privilege deployment user, hardened SSH defaults, offsite/encrypted backups, robust rollback automation, centralized logs, and automated security updates.

Detailed findings (categorized)
--------------------------------
Critical (must fix before production)
- Running PM2 as root (script runs `pm2 startup` for root).
  Risk: any Node process run as root has full system privileges — major security risk.
  Fix: create a non-root `deploy` user; run PM2 under that user; use `pm2 startup systemd -u deploy --hp /home/deploy` and `pm2 save`.

- SSH hardening absent (password auth still possible; script does not disable root password login).
  Risk: brute-force or leaked password compromise.
  Fix: disable password auth and root login only after verifying key-based access; use AllowUsers or PermitRootLogin no; consider SSH rate limiting.

- No offsite encrypted backups.
  Risk: single-host backups are lost if disk fails or attacker ransoms server.
  Fix: copy backups to an offsite store (S3 with server-side encryption, or another host) and encrypt backups at rest.

High
- PostgreSQL user/db not created by default in script.
  Risk: app deploy will fail until DB and role exist; leaving DB creation to a later manual step causes drift.
  Fix: Create a dedicated Postgres role (jkbalaji) with a strong random password and a dedicated database; store the password securely (vault or encrypted file).

- PM2 configured for root (related to critical) and pm2 processes started as root.
  Risk: service management, log ownership and restart behavior not following least-privilege model.
  Fix: create deploy user; migrate pm2 startup accordingly.

- No unattended-upgrades or automatic security updates configured.
  Risk: server remains vulnerable to known CVEs.
  Fix: install and configure `unattended-upgrades` and configure notifications.

Medium
- Nginx configuration minimal — no security headers, no rate-limiting, no SSL configuration.
  Risk: insecure headers, lack of TLS, missing HSTS.
  Fix: prepare recommended nginx server block template with security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy), limit upload size, enable TLS via certbot.

- Fail2ban configured at default package install only; script does not add project-specific jail or whitelist admin IPs.
  Risk: ineffective or over-aggressive banning, or gaps for new attack vectors (e.g., npm registry abuse).
  Fix: add jail configs for sshd and nginx, tune bantime/maxretry and whitelist trusted IPs.

- Backup tar creation uses `tar` across paths; the script doesn't verify remote tar success before DB dump or ensure atomic backup naming strategy is fully robust.
  Risk: partial backup if tar fails; inconsistent backup set.
  Fix: use `set -o pipefail`, check exit codes, create a single wrapper that creates both DB dump and file archive and only mark completed when both succeed.

Low
- Using /root/jkbalaji as project root.
  Risk: storing apps under /root makes operations tied to root and complicates non-root deployment; backups in root are root-only.
  Fix: prefer `/srv/jkbalaji` or `/opt/jkbalaji` and a non-root `deploy` user owning app folders.

- PM2 global install as root via npm (ok) but no version lock; no verification of pm2 systemd unit produced.
  Fix: pin pm2 version and verify generated systemd unit; consider using `npx pm2` installed under deploy user.

- No centralized logging (rsyslog/logstash/ELK) or monitoring (Prometheus, node_exporter) configuration.
  Recommendation: add basic monitoring and remote log shipping.

Optional
- Change default SSH port.
  Note: security by obscurity only; use in conjunction with key-only auth and firewall rules.

- Enable AppArmor profile for Node apps (advanced).

Component-level review & suggestions
-----------------------------------
Ubuntu compatibility
- Commands are standard for Ubuntu LTS (apt, systemctl, NodeSource). NodeSource setup_22.x is compatible with Ubuntu 22.04/24.04+.
- Ensure `curl | bash` usage is acceptable in your security policy; alternatively add NodeSource apt key and repo explicitly.

Node.js 22 installation method
- NodeSource script is widely used and acceptable. Risk: piping remote script to bash — verify GPG keys when strict compliance required.
- Alternative: use Ubuntu PPA with explicit key import, or use `nvm` for per-user installs (not recommended for production).

PM2 configuration
- Script runs `pm2 startup` for root. Best practice: create `deploy` user and run `pm2 startup` as that user and `pm2 save` under that user.
- Also consider using systemd unit files that exec `pm2 resurrect` and provide `Restart=on-failure` semantics.

PostgreSQL configuration
- Script installs postgres and leaves default config (listen_addresses='localhost' by default) — good.
- Missing: create role user + database, set strong password, and restrict pg_hba to `local` / `127.0.0.1` for app connections. If remote access needed, configure certificates and firewall accordingly.
- Enable automatic backups and retention policy; ensure `pg_dump` path is validated.

Nginx configuration
- Script installs and enables nginx but creates no app-specific server block (this was in later deployment scripts).
- Add secure defaults: `server_tokens off; client_max_body_size; add_header` for security headers; configure `ssl_ciphers` and `ssl_protocols` when enabling TLS.

UFW configuration
- Script sets default deny incoming, allows ssh, http, https — good baseline.
- Recommend: `ufw limit ssh` to rate-limit brute-force attempts; restrict ssh to specific admin IPs where feasible.

Fail2ban configuration
- Script enables fail2ban but does not create jails; add `jail.local` entries for sshd and nginx and tune `maxretry`/`bantime`.

Backup strategy
- Script creates local backups under `/root/jkbalaji/backups` and local fetch via scp/rsync — adequate for immediate restore.
- Missing: offsite replication, encryption at rest, integrity verification (checksums), and automated restore testing.
 Recommended: push backups to S3 or remote host using lifecycle rules and encryption (AWS KMS or GPG).

Rollback strategy
- Script backs up before deploy and renames previous folder to `_bak_` timestamp — good basic approach.
- Missing: automated health-check window that triggers automatic rollback if app fails post-deploy; no retention policy for multiple historical versions besides backups.
 Recommended: implement staged deploy with health probes and automatic revert if probe fails within N minutes.

Error handling
- Script uses `set -euo pipefail` — good.
- But needs traps for cleanup and clearer exit codes/log messages. Add `trap 'on_error' ERR` with function to collect logs and optionally revert partial changes.

Logging
- Script writes a report file but does not centralize logs. Improved deployment scripts write logs under E:\JKbalaji\deployment\logs.
- Recommend structured logs (JSON) and log rotation (logrotate configured for /opt or /root logs).

Directory structure
- The script uses `/root/jkbalaji` — functional, but best practice is to use `/opt/jkbalaji` or `/srv/jkbalaji` with a `deploy` owner. Storing app files under /root ties deployment to root user.

Service startup after reboot
- systemctl enable for nginx/postgresql/fail2ban done. PM2 startup created for root but needs `pm2 save` to persist processes. Confirm `pm2 save` is executed after apps are started.

SSH security
- Script does not disable password authentication or `PermitRootLogin`. Must NOT disable root or password auth until you verify key-based login for deploy user exists.
- After verification: disable password authentication, set `PermitRootLogin no`, and restrict allowed users.

Least-privilege access
- Currently script runs services and PM2 as root. Best practice: create `deploy` user, run Node processes under that user, and keep file ownership and permissions accordingly.
- PostgreSQL runs as postgres user (default) — correct.

Missing items before first deployment
- Create non-root `deploy` user and migrate PM2 to it.
- Ensure PostgreSQL role and database are created (jkbalaji).
- Create env files with secure permissions for production secrets (not checked into repo).
- Configure TLS (Let's Encrypt) in Nginx once DNS resolves.
- Offsite encrypted backup target.
- Monitoring (Prometheus/node-exporter) and alerting (email/Slack).
- Automated security updates (unattended-upgrades).
- Harden SSH and Fail2ban jails; whitelist admin IPs.

Best-practice changes (recommended order)
1. Create non-root `deploy` user and use it for all app runtime and deployments.
2. Move app root from /root/jkbalaji to /opt/jkbalaji or /srv/jkbalaji; ensure ownership by `deploy`.
3. Implement PM2 under `deploy` user: `sudo -u deploy pm2 startup systemd -u deploy --hp /home/deploy` and `pm2 save`.
4. Create PostgreSQL role `jkbalaji` and DB, store password securely in server environment or vault.
5. Harden SSH (disable password auth, disable root login after keys verified, use AllowUsers).
6. Configure UFW to limit SSH (ufw limit ssh) and restrict SSH to admin IPs if possible.
7. Configure Fail2ban with specific jails for ssh and nginx and tune thresholds.
8. Implement encrypted offsite backups with automated retention and test restores.
9. Configure Nginx server block templates with security headers and TLS (certbot).
10. Add monitoring/alerting and central log shipping.

Answers to requested questions
--------------------------------
1. Is the script production-ready?
   No. The script prepares software and directories but leaves critical security and operational gaps (PM2 as root, SSH hardening, no offsite backups, no deploy user). It is a good development/test bootstrap but not production-ready without the recommended changes.

2. Is it safe for a dedicated JK Balaji VPS?
   Partially. On a brand-new, dedicated VPS it will work and not conflict with other apps. However, running PM2/apps as root and leaving SSH in default state is unsafe. Apply the "Critical" fixes before exposing to production traffic.

3. Should PM2 run as root or deploy user?
   PM2 should run as a non-root `deploy` user. Running as root is high risk; create a dedicated user for app processes and deployments, set correct filesystem permissions, and configure PM2 startup for that user.

4. Should PostgreSQL user and database be created during setup?
   Yes — creating a dedicated DB role and database (e.g., role `jkbalaji`, DB `jkbalaji`) during VPS prep simplifies first deployment and avoids runtime failures. Ensure the password is randomly generated and stored securely.

5. Is anything missing before first deployment?
   Yes — create deploy user, create DB/role, set environment secrets, configure TLS, offsite backups, monitoring, and SSH hardening. Also validate Node/npm/pm2 versions and ensure package managers allowed by policy.

6. What security hardening should be done before production?
   - Disable SSH password authentication and root password login (after key verification).
   - Create non-root deploy user; run apps under that account.
   - Configure UFW to limit SSH and whitelist admin ranges.
   - Configure Fail2ban jails for ssh and nginx and tune values.
   - Enable unattended-upgrades or a patch management process.
   - Use TLS (Let's Encrypt) and set secure ciphers/HSTS.
   - Encrypt backups at rest and transfer them offsite.
   - Limit sudoers privileges for deploy user (use `NOPASSWD` only for specific commands if needed).
   - Run regular security scans and configure monitoring/alerts.

Final score: 72/100
----------------------
Scoring breakdown (informal):
- Base functionality & completeness: 30/40
- Security posture & least-privilege: 12/30
- Robustness (backup, rollback, logging): 12/20
- Operational readiness (monitoring, updates): 8/10

Conclusion
----------
The script is a solid starting point for preparing a fresh VPS. Before production use, implement the critical and high-priority fixes: create a non-root deploy user and run PM2 under it, harden SSH, configure encrypted offsite backups, create the Postgres role and DB, enable unattended upgrades, and add monitoring and alerting. After those changes the server preparation will be production-ready.

If you want, I can:
- Produce the exact sequence of commands to create the `deploy` user and migrate PM2 to that user (safe, idempotent).
- Produce a hardened `sshd_config` snippet and the exact steps to enable it safely.
- Produce systemd/pm2 instructions for the `deploy` user and a template Nginx server block with security headers and certbot instructions.

End of review.

