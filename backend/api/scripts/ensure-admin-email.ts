/**
 * Create admin@jkbalaji.com only if missing. Does not change existing passwords.
 * Set ADMIN_SETUP_PASSWORD for the initial password when creating a new account.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient, UserRole } from '../src/generated/prisma/client.js';

const __dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dir, '../.env') });

const TARGET_EMAIL = (process.env.TARGET_ADMIN_EMAIL || 'admin@jkbalaji.com').trim().toLowerCase();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const existing = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (existing) {
    console.log(`EXISTS: ${TARGET_EMAIL} (role=${existing.role}, active=${existing.isActive}) — no changes made`);
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const password = process.env.ADMIN_SETUP_PASSWORD?.trim();
  if (!password) {
    console.error(`MISSING: ADMIN_SETUP_PASSWORD env var required to create ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password);
  await prisma.user.create({
    data: {
      email: TARGET_EMAIL,
      passwordHash,
      name: 'JK Balaji Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`CREATED: ${TARGET_EMAIL} (SUPER_ADMIN) — password from ADMIN_SETUP_PASSWORD only`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
