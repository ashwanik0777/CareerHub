const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PASSWORD_HASH = '$2a$10$4V0XjGDjt2.967Dh2dl8e.wvFbwTDS5Vtjd1Ob2fSy6FeAFVwThi6'; // Hashed 'password123'

async function main() {
  console.log('Starting seeding database...');

  // Clean existing entries (in cascade sequence or reset tables)
  await prisma.user.deleteMany({});
  console.log('Cleared existing user data.');

  // 1. Create Standard User
  const user = await prisma.user.create({
    data: {
      email: 'user@platform.com',
      passwordHash: PASSWORD_HASH,
      name: 'Jane Doe',
      role: 'USER',
      isEmailVerified: true,
      profile: {
        create: {
          headline: 'Senior Full Stack Engineer',
          bio: 'Specialized in TypeScript, Next.js, and distributed systems architecture.',
          location: 'San Francisco, CA',
          preferredLocation: 'Remote / Hybrid',
          availability: 'Immediate',
          websiteUrl: 'https://janedoe.dev',
          githubUrl: 'https://github.com/janedoe',
          linkedinUrl: 'https://linkedin.com/in/janedoe',
          experiences: {
            create: [
              {
                company: 'Stripe',
                position: 'Senior Software Engineer',
                location: 'San Francisco, CA',
                startDate: new Date('2023-01-15'),
                isCurrent: true,
                type: 'FULL_TIME',
                description: 'Architected robust transaction processing APIs and scaled internal database query performance.',
              },
              {
                company: 'Vercel',
                position: 'Software Developer',
                location: 'Remote',
                startDate: new Date('2021-06-01'),
                endDate: new Date('2022-12-31'),
                isCurrent: false,
                type: 'FULL_TIME',
                description: 'Optimized build worker processes and enhanced edge function rendering runtimes.',
              }
            ],
          },
          educations: {
            create: [
              {
                school: 'Stanford University',
                degree: 'M.S.',
                fieldOfStudy: 'Computer Science',
                startDate: new Date('2019-09-01'),
                endDate: new Date('2021-05-31'),
                isCurrent: false,
                grade: '3.9 GPA',
                description: 'Focused on distributed computing systems and data indexing algorithms.',
              }
            ],
          },
          projects: {
            create: [
              {
                title: 'Secure Autofill Extension',
                description: 'A browser extension content companion injecting secure user profile tokens into forms.',
                url: 'https://github.com/janedoe/autofill-client',
                githubUrl: 'https://github.com/janedoe/autofill-client',
                startDate: new Date('2024-01-01'),
                technologies: ['TypeScript', 'Vite', 'Chrome Extension MV3'],
              }
            ],
          },
          skills: {
            create: [
              { name: 'TypeScript', level: 'EXPERT', category: 'Languages' },
              { name: 'React', level: 'EXPERT', category: 'Frameworks' },
              { name: 'Node.js', level: 'ADVANCED', category: 'Backend' },
              { name: 'PostgreSQL', level: 'ADVANCED', category: 'Databases' }
            ],
          },
          languages: {
            create: [
              { name: 'English', proficiency: 'NATIVE' },
              { name: 'Spanish', proficiency: 'PROFESSIONAL' }
            ],
          }
        },
      },
      settings: {
        create: {
          emailNotifications: true,
          profileVisibility: 'PUBLIC',
          themePreference: 'dark',
          languagePreference: 'en',
        },
      },
      subscription: {
        create: {
          tier: 'PRO',
          isActive: true,
        },
      },
    },
  });

  console.log(`Standard User seeded: ${user.email} (Password: password123)`);

  // 2. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      passwordHash: PASSWORD_HASH,
      name: 'Admin Manager',
      role: 'ADMIN',
      isEmailVerified: true,
      profile: {
        create: {
          headline: 'System Administrator',
          bio: 'Platform administration overview monitor.',
        },
      },
      settings: {
        create: {
          emailNotifications: true,
          profileVisibility: 'PRIVATE',
          themePreference: 'dark',
          languagePreference: 'en',
        },
      },
    },
  });

  console.log(`Admin User seeded: ${admin.email} (Password: password123)`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
