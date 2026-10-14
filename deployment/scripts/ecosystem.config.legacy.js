/**
 * PM2 ecosystem - JK Balaji (Hostinger VPS, Ubuntu 24.04, no Docker).
 * Usage (from repo root on the server, e.g. /var/www/jkbalaji/current):
 *   pm2 start deploy/pm2/ecosystem.config.js --env production
 *   pm2 save && pm2 startup systemd
 *
 * Memory budget tuned for KVM 1 (1 vCPU / 4 GB RAM) shared with PostgreSQL:
 *   web ~150-300 MB, api ~120-250 MB, PostgreSQL ~0.6-1 GB, OS/Nginx ~400 MB  => ample headroom.
 * --max-old-space-size caps the V8 heap; max_memory_restart is the safety net (RSS) above it.
 * On KVM 2 (2 vCPU / 8 GB) you may run the api with instances: 2, exec_mode: 'cluster'.
 *
 * File is CommonJS on purpose (.js under a root package.json without "type": "module").
 */
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');

module.exports = {
  apps: [
    {
      name: 'jkbalaji-web',
      // Next.js standalone server (next.config.ts -> output: 'standalone')
      cwd: path.join(ROOT, 'apps/web/.next/standalone/apps/web'),
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=384',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
        API_INTERNAL_URL: 'http://127.0.0.1:4000',
      },
      time: true,
      merge_logs: true,
      out_file: path.join(ROOT, 'logs/web.out.log'),
      error_file: path.join(ROOT, 'logs/web.err.log'),
      kill_timeout: 5000,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '20s',
      autorestart: true,
      watch: false,
    },
    {
      name: 'jkbalaji-api',
      cwd: path.join(ROOT, 'apps/api'),
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=320 --enable-source-maps',
      max_memory_restart: '448M',
      // Secrets are read from apps/api/.env (copied from deploy/env/api.production.env.example), not stored here.
      env_production: {
        NODE_ENV: 'production',
        APP_PORT: 4000,
        APP_HOST: '127.0.0.1',
        TZ: 'Asia/Kolkata',
      },
      time: true,
      merge_logs: true,
      out_file: path.join(ROOT, 'logs/api.out.log'),
      error_file: path.join(ROOT, 'logs/api.err.log'),
      kill_timeout: 10000, // allow graceful shutdown (Prisma disconnect, in-flight requests)
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '20s',
      autorestart: true,
      watch: false,
    },
  ],
};
