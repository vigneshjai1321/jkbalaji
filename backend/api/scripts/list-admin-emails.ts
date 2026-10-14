import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient, UserRole } from '../src/generated/prisma/client.js';

const __dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dir, '../.env') });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('NO_DATABASE_URL');
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] } },
    select: { email: true, role: true },
    orderBy: { email: 'asc' },
  });
  for (const u of users) console.log(`${u.email}\t${u.role}`);
  const com = await prisma.user.findUnique({ where: { email: 'admin@jkbalaji.com' } });
  const inn = await prisma.user.findUnique({ where: { email: 'admin@jkbalaji.in' } });
  console.log('---');
  console.log('admin@jkbalaji.com', com ? 'EXISTS' : 'MISSING');
  console.log('admin@jkbalaji.in', inn ? 'EXISTS' : 'MISSING');
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
