import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create superadmin if doesn't exist
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@platform.com' },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        email: 'admin@platform.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'superadmin',
        villageId: null,
      },
    });
    console.log('Superadmin created: admin@platform.com / Admin@123');
  } else {
    console.log('Superadmin already exists.');
  }

  // Create sample tehsil if none exist
  const tehsilCount = await prisma.tehsil.count();
  if (tehsilCount === 0) {
    await prisma.tehsil.create({
      data: {
        name: 'हुजूर',
        district: 'भोपाल',
        state: 'मध्य प्रदेश',
      },
    });
    console.log('नमुना तहसील तयार झाली.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
