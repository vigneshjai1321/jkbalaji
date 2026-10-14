import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as argon2 from 'argon2';
import { PrismaClient, SiteKey, UserRole } from '../../backend/api/src/generated/prisma/client.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@jkbalaji.com').trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe@JK2026!';
  const forcePassword = process.env.SEED_FORCE_PASSWORD_RESET === '1';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing && !forcePassword) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: UserRole.SUPER_ADMIN, isActive: true, name: 'JK Balaji Admin' },
    });
  } else {
    const passwordHash = await argon2.hash(adminPassword);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        name: 'JK Balaji Admin',
      },
      create: {
        email: adminEmail,
        passwordHash,
        name: 'JK Balaji Admin',
        role: UserRole.SUPER_ADMIN,
      },
    });
  }

  await prisma.jewelleryProduct.createMany({
    data: [
      {
        name: 'Classic Gold Chain 22K',
        slug: 'classic-gold-chain-22k',
        category: 'Chains',
        weightGrams: 8.5,
        makingCharge: 2500,
        featured: true,
      },
      {
        name: 'Temple Bangle Set',
        slug: 'temple-bangle-set',
        category: 'Bangles',
        weightGrams: 32,
        makingCharge: 8500,
        featured: true,
      },
    ],
    skipDuplicates: true,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.goldRate.create({
    data: {
      rate22k: 6850,
      rate24k: 7480,
      effectiveDate: today,
    },
  });

  await prisma.jewelleryScheme.createMany({
    data: [
      { title: 'Monthly Gold Savings Scheme', description: 'Save monthly and redeem on jewellery purchases.' },
      { title: 'Wedding Collection Plan', description: 'Plan ahead for wedding jewellery with flexible installments.' },
    ],
  });

  await prisma.offer.createMany({
    data: [
      { site: SiteKey.REAL_ESTATE, title: 'Booking Advance Offer', description: 'Special advance benefits on select plots.' },
      { site: SiteKey.JEWELLERY, title: 'Making Charge Waiver', description: 'Limited period offer on select collections.' },
    ],
  });

  await prisma.siteContent.createMany({
    data: [
      { site: SiteKey.REAL_ESTATE, key: 'hero_title', value: 'Trusted Real Estate in Cheyyar' },
      { site: SiteKey.REAL_ESTATE, key: 'hero_subtitle', value: 'Layouts, plots, and transparent documentation.' },
      { site: SiteKey.JEWELLERY, key: 'hero_title', value: 'Cheyyar Balaji Jewellers' },
      { site: SiteKey.JEWELLERY, key: 'hero_subtitle', value: 'Hallmarked gold jewellery with GST billing.' },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      { title: 'Welcome to JK Balaji ERP', body: 'Your enterprise dashboard is connected to PostgreSQL.' },
      { title: 'Security reminder', body: 'Rotate the default admin password after first login.' },
    ],
  });

  console.log('Seed complete. Admin:', adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
