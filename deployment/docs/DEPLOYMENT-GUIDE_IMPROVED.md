JK Balaji — Deployment Guide (Improved scripts)

Location: E:\JKbalaji\deployment

Improved files:
- verify-server.ps1 — verify remote host identity and SSH connectivity
- backup-before-deploy.ps1 — timestamped remote backup (tar + pg dump), fetch via rsync/scp, dry-run
- deploy-frontend_improved.ps1 — rsync upload, tmp swap, remote build, pm2 restart, logging, dry-run
- deploy-backend_improved.ps1 — rsync upload, tmp swap, remote build, migrations, pm2 restart, logging, dry-run
- deploy-all_improved.ps1 — orchestration: verify -> backup -> backend -> frontend -> restart -> health -> summary
- rollback_improved.ps1 — list backups, explicit confirmation required, dry-run support
- restore-database_improved.ps1 — upload and restore DB dump
- restart-services_improved.ps1 — restart nginx/postgres/pm2 and verify
- health-check_improved.ps1 — remote health checks with outputs
- env/ — example env files: frontend.env.example, backend.env.example, production.env.example

Key improvements & usage notes:
- Use the _improved scripts for production-ready deployment with logging and dry-run support.
- Scripts prefer rsync for uploads; if rsync is not present locally they fall back to scp.
- All critical operations create timestamped backups and save logs under E:\JKbalaji\deployment\logs.
- Rollback requires explicit -ConfirmRollback to avoid accidental restores.
- verify-server.ps1 enforces hostname 'jkbalaji.vps' and will stop if mismatch.
- Use -DryRun to validate a deployment without making remote changes.

Recommended Flow:
1) Run verify-server.ps1
2) Run deploy-all_improved.ps1 -KeyPath C:\path\to\key -DryRun
3) Remove -DryRun and run deploy-all_improved.ps1 for real deployment
4) Inspect logs in E:\JKbalaji\deployment\logs and remote backups in /root/jkbalaji/backups

Security Recommendations (summary):
- Use SSH key authentication only; disable root password login after testing.
- Store secrets on the server in environment files with secure permissions (chmod 600).
- Keep backups offsite (S3 or remote host) for disaster recovery.

