import assert from 'assert';

// 1. Simulating Profile Completeness Scoring Logic
function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.headline) score += 15;
  if (profile.bio) score += 15;
  if (profile.location) score += 10;
  if (profile.experiences && profile.experiences.length > 0) score += 20;
  if (profile.educations && profile.educations.length > 0) score += 20;
  if (profile.projects && profile.projects.length > 0) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 10;
  return score;
}

// 2. Simulating Job Matching Algorithm
function matchJob(profileSkills: string[], jobDescription: string): number {
  const jdKeywords = ['react', 'next.js', 'typescript', 'postgres', 'docker', 'graphql', 'node.js', 'aws'];
  const matched: string[] = [];
  const missing: string[] = [];

  const lowerSkills = profileSkills.map(s => s.toLowerCase());

  jdKeywords.forEach(skill => {
    if (lowerSkills.includes(skill) || jobDescription.toLowerCase().includes(skill)) {
      if (lowerSkills.includes(skill)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }
  });

  return Math.round(40 + (matched.length / (matched.length + missing.length || 1)) * 50);
}

// 3. Test Suites
function runTests() {
  console.log('Starting System Unit Tests...');

  // Test 1: Empty Profile Completion Score
  console.log('Running Test 1: Empty profile completion...');
  assert.strictEqual(calculateProfileCompletion(null), 0);
  assert.strictEqual(calculateProfileCompletion({}), 0);
  console.log('✔ Test 1 passed.');

  // Test 2: Full Profile Completion Score
  console.log('Running Test 2: Complete profile scoring...');
  const fullProfile = {
    headline: 'Senior Lead Architect',
    bio: 'Experienced engineer specializing in distributed systems.',
    location: 'San Francisco, CA',
    experiences: [{ company: 'Stripe' }],
    educations: [{ school: 'Stanford University' }],
    projects: [{ title: 'ProfilePlatform' }],
    skills: [{ name: 'React' }],
  };
  assert.strictEqual(calculateProfileCompletion(fullProfile), 100);
  console.log('✔ Test 2 passed.');

  // Test 3: Partial Profile Completion Score
  console.log('Running Test 3: Partial profile scoring...');
  const partialProfile = {
    headline: 'Developer',
    location: 'Seattle, WA',
    skills: [{ name: 'TypeScript' }],
  };
  assert.strictEqual(calculateProfileCompletion(partialProfile), 35); // 15 + 10 + 10 = 35
  console.log('✔ Test 3 passed.');

  // Test 4: Job Matching Score
  console.log('Running Test 4: AI Job Matcher accuracy...');
  const profileSkills = ['React', 'TypeScript', 'Node.js'];
  const jdText = 'Looking for a Next.js frontend developer who knows React, TypeScript, and AWS cloud management.';
  
  // Matched: react, typescript, next.js, aws, node.js
  // profileSkills has: React, TypeScript, Node.js (matches: react, typescript, node.js)
  // Missing/JD has: next.js, aws
  // Total matches = 3, Total missing = 2
  // Score = 40 + (3 / 5) * 50 = 40 + 30 = 70
  const score = matchJob(profileSkills, jdText);
  assert.strictEqual(score, 70);
  console.log('✔ Test 4 passed.');

  console.log('\nAll System Unit Tests Completed Successfully!');
}

try {
  runTests();
  process.exit(0);
} catch (error) {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
}
