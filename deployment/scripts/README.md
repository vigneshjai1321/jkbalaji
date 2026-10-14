# deploy/scripts

| Script          | Purpose                                                                                   |
|-----------------|-------------------------------------------------------------------------------------------|
| `deploy.sh`     | Release flow: backup -> unpack/build -> link shared env -> migrate -> switch symlink -> PM2 reload -> health check -> prune |
| `backup-db.sh`  | `pg_dump -Fc` with retention + verification; cron daily; off-site copy hook               |

Both are **documented templates**: destructive/remote steps are commented out until the server is provisioned.
Run `chmod +x deploy/scripts/*.sh` on the server (Windows checkouts drop the executable bit).
Planned additions: `server-setup.md` checklist (users, UFW, fail2ban, swap, Node 22, PostgreSQL, Nginx, Certbot).
