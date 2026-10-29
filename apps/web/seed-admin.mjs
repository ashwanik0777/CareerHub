import { PrismaClient } from '@platform/db';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@platform.com';
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log(`Admin user already exists!`);
    console.log(`Email: ${existingAdmin.email}`);
    console.log(`Password: You can reset it if you don't know it, or we can just reset it now.`);
    
    // Force reset for convenience
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { passwordHash }
    });
    console.log(`Admin password has been reset to: admin123`);
  } else {
    // Create new admin
    const passwordHash = await bcrypt.hash('admin123', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin User',
        role: 'ADMIN',
        isEmailVerified: true
      }
    });
    console.log(`Created new admin user!`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Password: admin123`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
