/**
 * Create scoped business admin accounts if missing. Never overwrites existing users.
 * Passwords supplied via env vars only (not logged).
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

type Spec = {
  email: string;
  loginId: string;
  name: string;
  role: UserRole;
  passwordEnv: string;
};

const ACCOUNTS: Spec[] = [
  {
    email: 'realestate_admin@jkbalaji.in',
    loginId: 'realestateadmin',
    name: 'Real Estate Admin',
    role: UserRole.REAL_ESTATE_MANAGER,
    passwordEnv: 'RE_ADMIN_SETUP_PASSWORD',
  },
  {
    email: 'jewellery_admin@jkbalaji.in',
    loginId: 'jewelleryadmin',
    name: 'Jewellery Admin',
    role: UserRole.GOLD_MANAGER,
    passwordEnv: 'JEW_ADMIN_SETUP_PASSWORD',
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const results: { email: string; status: 'CREATED' | 'EXISTS'; role: string }[] = [];

  for (const spec of ACCOUNTS) {
    const email = spec.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (!existing.loginId) {
        await prisma.user.update({ where: { id: existing.id }, data: { loginId: spec.loginId } });
        console.log(`UPDATED loginId: ${spec.loginId} for ${email}`);
      }
      results.push({ email, status: 'EXISTS', role: existing.role });
      console.log(`EXISTS: ${email} role=${existing.role}`);
      continue;
    }

    const password = process.env[spec.passwordEnv]?.trim();
    if (!password) {
      console.error(`MISSING: ${spec.passwordEnv} required to create ${email}`);
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password);
    await prisma.user.create({
      data: {
        email,
        loginId: spec.loginId,
        passwordHash,
        name: spec.name,
        role: spec.role,
        isActive: true,
        department: spec.role === UserRole.GOLD_MANAGER ? 'Jewellery' : 'Real Estate',
      },
    });
    results.push({ email, status: 'CREATED', role: spec.role });
    console.log(`CREATED: ${email} role=${spec.role}`);
  }

  await prisma.$disconnect();
  await pool.end();
  console.log(JSON.stringify({ ok: true, results }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
