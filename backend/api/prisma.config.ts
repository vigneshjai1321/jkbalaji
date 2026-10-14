import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 CLI configuration.
 * Schema and migrations live under /database (single source of truth).
 */
export default defineConfig({
  schema: '../../database/prisma/schema.prisma',
  migrations: {
    path: '../../database/migrations',
    seed: 'tsx ../../database/seeds/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
