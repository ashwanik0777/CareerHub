import { ProfileService, ProfessionalProfile } from './index';

const testProfile: ProfessionalProfile = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  personal: {
    firstName: 'John',
    lastName: 'Doe',
  },
  contact: {
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567',
  },
  education: [
    {
      institutionName: 'Stanford University',
      degree: 'B.S. Computer Science',
      startDate: new Date('2015-09-01'),
      endDate: new Date('2019-06-01'),
      isCurrent: false,
    },
    {
      institutionName: 'MIT',
      degree: 'M.S. Artificial Intelligence',
      startDate: new Date('2019-09-01'),
      endDate: new Date('2021-06-01'),
      isCurrent: false,
    }
  ],
  experience: [
    {
      companyName: 'Google',
      title: 'Software Engineer',
      startDate: new Date('2021-07-01'),
      endDate: new Date('2023-01-01'),
      isCurrent: false,
    },
    {
      companyName: 'DeepMind',
      title: 'Senior AI Engineer',
      startDate: new Date('2023-02-01'),
      isCurrent: true,
    }
  ],
  projects: [],
  skills: [],
  certificates: [],
  research: [],
  publications: [],
  languages: [],
  achievements: [],
};

function runTest() {
  console.log('--- Starting Integration Test ---');
  
  // 1. Cache Profile
  ProfileService.cacheProfile(testProfile);
  console.log('Profile Cached.');

  // 2. Resolve Fields
  const fieldsToResolve = [
    'personal.full_name',
    'contact.email',
    'education.college',
    'education.degree',
    'experience.company_name',
    'experience.title'
  ];

  console.log('\n--- Resolving Single Fields ---');
  for (const label of fieldsToResolve) {
    const val = ProfileService.resolveField(testProfile.userId, label);
    console.log(`[${label}] -> ${val}`);
  }

  // 3. Completeness
  console.log('\n--- Profile Completeness ---');
  const completeness = ProfileService.getCompleteness(testProfile.userId);
  console.log(JSON.stringify(completeness, null, 2));
}

runTest();
