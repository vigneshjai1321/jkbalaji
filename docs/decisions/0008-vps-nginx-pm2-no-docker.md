# 0008. Hostinger VPS + Nginx + PM2, no Docker
- Status: Accepted, 2026-10-07
## Decision
Single Ubuntu 24.04 VPS. Nginx terminates TLS and routes `/` to :3000 and `/api` to :4000. PM2 runs both apps in fork mode with memory caps. PostgreSQL runs on the same host, bound to localhost. Builds happen off-server and are deployed as release folders with a symlink switch.
## Consequences
+ Lowest cost and RAM overhead, simple ops for one developer.
- Manual server provisioning (documented). Single point of failure, mitigated by daily and off-site backups and a documented restore.
