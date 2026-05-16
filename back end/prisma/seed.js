// Database seed — CampusCare
// Run: npm run db:seed
// Safe to re-run (uses upsert — no duplicates)
require('dotenv/config');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@campuscare.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@campuscare.com',
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('Admin seeded: admin@campuscare.com / admin123');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
