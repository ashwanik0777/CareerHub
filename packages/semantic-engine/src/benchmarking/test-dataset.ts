// ────────────────────────────────────────────────────────────────────────────
// Benchmark Test Dataset — 50 Curated Test Cases
// ────────────────────────────────────────────────────────────────────────────
// Realistic field descriptors collected from Greenhouse, Lever, Workday,
// LinkedIn, Indeed, and generic ATS platforms.
// ────────────────────────────────────────────────────────────────────────────

import { FieldDescriptor } from '../interfaces';

/**
 * A single benchmark test case.
 */
export interface TestCase {
  /** Unique test case identifier */
  id: string;
  /** Human-readable description of the test scenario */
  description: string;
  /** The field descriptor to analyze */
  descriptor: FieldDescriptor;
  /** Expected ontology attribute ID (ground truth) */
  expectedAttributeId: string;
  /** Source platform for context */
  platform: string;
}

/**
 * Helper to create a full FieldDescriptor with sensible defaults.
 */
function fd(partial: Partial<FieldDescriptor>): FieldDescriptor {
  return {
    label: '',
    placeholder: '',
    name: '',
    id: '',
    ariaLabel: '',
    title: '',
    nearbyText: '',
    parentSection: '',
    formContext: '',
    inputType: 'text',
    isRequired: false,
    ...partial,
  };
}

/**
 * 50 curated test cases spanning all major ATS platforms and field types.
 */
export const TEST_DATASET: TestCase[] = [
  // ── PERSONAL INFORMATION (1–8) ─────────────────────────────────────────────
  {
    id: 'TC-001',
    description: 'Greenhouse first name field',
    descriptor: fd({ label: 'First Name', name: 'first_name', id: 'first_name', placeholder: 'Enter first name', parentSection: 'Personal Information', isRequired: true }),
    expectedAttributeId: 'personalInfo.firstName',
    platform: 'greenhouse',
  },
  {
    id: 'TC-002',
    description: 'Greenhouse last name field',
    descriptor: fd({ label: 'Last Name', name: 'last_name', id: 'last_name', placeholder: 'Enter last name', parentSection: 'Personal Information', isRequired: true }),
    expectedAttributeId: 'personalInfo.lastName',
    platform: 'greenhouse',
  },
  {
    id: 'TC-003',
    description: 'Lever full name field',
    descriptor: fd({ label: 'Full Name', name: 'name', id: 'name', placeholder: 'Your full name', isRequired: true }),
    expectedAttributeId: 'name',
    platform: 'lever',
  },
  {
    id: 'TC-004',
    description: 'LinkedIn headline field',
    descriptor: fd({ label: 'Headline', name: 'headline', id: 'profile-headline', placeholder: 'e.g. Software Engineer at Google', nearbyText: 'Professional headline' }),
    expectedAttributeId: 'personalInfo.headline',
    platform: 'linkedin',
  },
  {
    id: 'TC-005',
    description: 'Workday professional summary textarea',
    descriptor: fd({ label: 'Professional Summary', name: 'summary', id: 'bio-section', placeholder: 'Tell us about yourself...', inputType: 'textarea', parentSection: 'About' }),
    expectedAttributeId: 'personalInfo.bio',
    platform: 'workday',
  },
  {
    id: 'TC-006',
    description: 'Generic location field',
    descriptor: fd({ label: 'City, State', name: 'location', id: 'applicant-location', placeholder: 'e.g. San Francisco, CA', parentSection: 'Contact Details' }),
    expectedAttributeId: 'personalInfo.location',
    platform: 'generic',
  },
  {
    id: 'TC-007',
    description: 'Indeed cover letter field',
    descriptor: fd({ label: 'Cover Letter', name: 'cover_letter', id: 'cover-letter-text', inputType: 'textarea', placeholder: 'Why do you want this position?', parentSection: 'Application' }),
    expectedAttributeId: 'personalInfo.bio',
    platform: 'indeed',
  },
  {
    id: 'TC-008',
    description: 'Workday given name variation',
    descriptor: fd({ label: 'Given Name', name: 'legalNameSection_firstName', id: 'legal-first-name', isRequired: true, parentSection: 'Legal Name' }),
    expectedAttributeId: 'personalInfo.firstName',
    platform: 'workday',
  },

  // ── CONTACT INFORMATION (9–14) ────────────────────────────────────────────
  {
    id: 'TC-009',
    description: 'Standard email field',
    descriptor: fd({ label: 'Email Address', name: 'email', id: 'email-input', inputType: 'email', placeholder: 'your@email.com', isRequired: true }),
    expectedAttributeId: 'email',
    platform: 'generic',
  },
  {
    id: 'TC-010',
    description: 'Greenhouse email field',
    descriptor: fd({ label: 'Email', name: 'email', id: 'applicant-email', inputType: 'email', isRequired: true, parentSection: 'Basic Information' }),
    expectedAttributeId: 'email',
    platform: 'greenhouse',
  },
  {
    id: 'TC-011',
    description: 'Standard phone number field',
    descriptor: fd({ label: 'Phone Number', name: 'phone', id: 'phone-number', inputType: 'tel', placeholder: '+1 (555) 000-0000' }),
    expectedAttributeId: 'personalInfo.phone',
    platform: 'generic',
  },
  {
    id: 'TC-012',
    description: 'Workday phone with aria-label',
    descriptor: fd({ ariaLabel: 'Phone Number', name: 'phoneNumber', id: 'phone-input', inputType: 'tel', isRequired: true }),
    expectedAttributeId: 'personalInfo.phone',
    platform: 'workday',
  },
  {
    id: 'TC-013',
    description: 'Mobile number variation',
    descriptor: fd({ label: 'Mobile Number', name: 'mobile', id: 'mobile-field', inputType: 'tel', placeholder: 'Your mobile number' }),
    expectedAttributeId: 'personalInfo.phone',
    platform: 'generic',
  },
  {
    id: 'TC-014',
    description: 'Contact email variation',
    descriptor: fd({ label: 'Contact E-mail', name: 'contact_email', id: 'contact-email', inputType: 'email', parentSection: 'Contact' }),
    expectedAttributeId: 'email',
    platform: 'generic',
  },

  // ── SOCIAL PROFILES (15–20) ───────────────────────────────────────────────
  {
    id: 'TC-015',
    description: 'LinkedIn URL field',
    descriptor: fd({ label: 'LinkedIn Profile', name: 'linkedin_profile', id: 'linkedin-url', inputType: 'url', placeholder: 'https://linkedin.com/in/...' }),
    expectedAttributeId: 'linkedinUrl',
    platform: 'greenhouse',
  },
  {
    id: 'TC-016',
    description: 'GitHub URL field',
    descriptor: fd({ label: 'GitHub Profile', name: 'github_url', id: 'github-profile', inputType: 'url', placeholder: 'https://github.com/...' }),
    expectedAttributeId: 'githubUrl',
    platform: 'lever',
  },
  {
    id: 'TC-017',
    description: 'Portfolio website field',
    descriptor: fd({ label: 'Personal Website', name: 'website', id: 'portfolio-url', inputType: 'url', placeholder: 'https://yoursite.com' }),
    expectedAttributeId: 'websiteUrl',
    platform: 'generic',
  },
  {
    id: 'TC-018',
    description: 'Lever GitHub link field',
    descriptor: fd({ label: 'GitHub', name: 'urls[GitHub]', id: 'github-link', inputType: 'url', nearbyText: 'Social Profiles' }),
    expectedAttributeId: 'githubUrl',
    platform: 'lever',
  },
  {
    id: 'TC-019',
    description: 'Portfolio link variation',
    descriptor: fd({ label: 'Portfolio URL', name: 'portfolio', id: 'portfolio-link', inputType: 'url', nearbyText: 'Links' }),
    expectedAttributeId: 'websiteUrl',
    platform: 'generic',
  },
  {
    id: 'TC-020',
    description: 'LinkedIn with only aria-label',
    descriptor: fd({ ariaLabel: 'LinkedIn URL', name: 'social_1', id: 'link-1', inputType: 'url' }),
    expectedAttributeId: 'linkedinUrl',
    platform: 'generic',
  },

  // ── RESUME / FILE UPLOAD (21–23) ──────────────────────────────────────────
  {
    id: 'TC-021',
    description: 'Standard resume upload',
    descriptor: fd({ label: 'Upload Resume', name: 'resume', id: 'resume-upload', inputType: 'file', isRequired: true }),
    expectedAttributeId: 'resume_file',
    platform: 'greenhouse',
  },
  {
    id: 'TC-022',
    description: 'CV upload variation',
    descriptor: fd({ label: 'Upload CV', name: 'cv_file', id: 'cv-upload', inputType: 'file', nearbyText: 'Attach your CV (PDF, DOC)' }),
    expectedAttributeId: 'resume_file',
    platform: 'generic',
  },
  {
    id: 'TC-023',
    description: 'Resume attachment via aria',
    descriptor: fd({ ariaLabel: 'Attach Resume', name: 'attachment', id: 'file-input', inputType: 'file', parentSection: 'Documents' }),
    expectedAttributeId: 'resume_file',
    platform: 'workday',
  },

  // ── EMPLOYMENT (24–30) ────────────────────────────────────────────────────
  {
    id: 'TC-024',
    description: 'Company name field',
    descriptor: fd({ label: 'Company', name: 'company', id: 'company-name', placeholder: 'e.g. Google', parentSection: 'Experience' }),
    expectedAttributeId: 'experience.company',
    platform: 'greenhouse',
  },
  {
    id: 'TC-025',
    description: 'Job title / position field',
    descriptor: fd({ label: 'Job Title', name: 'position', id: 'job-title', placeholder: 'e.g. Software Engineer', parentSection: 'Experience' }),
    expectedAttributeId: 'experience.position',
    platform: 'generic',
  },
  {
    id: 'TC-026',
    description: 'Current employer field',
    descriptor: fd({ label: 'Current Employer', name: 'current_company', id: 'employer', nearbyText: 'Most Recent Position' }),
    expectedAttributeId: 'experience.company',
    platform: 'workday',
  },
  {
    id: 'TC-027',
    description: 'Organization name variation',
    descriptor: fd({ label: 'Organization', name: 'org', id: 'organization', parentSection: 'Work History' }),
    expectedAttributeId: 'experience.company',
    platform: 'lever',
  },
  {
    id: 'TC-028',
    description: 'Current role variation',
    descriptor: fd({ label: 'Current Role', name: 'role', id: 'current-role', placeholder: 'Your current position' }),
    expectedAttributeId: 'experience.position',
    platform: 'linkedin',
  },
  {
    id: 'TC-029',
    description: 'Designation field',
    descriptor: fd({ label: 'Designation', name: 'designation', id: 'designation-field', parentSection: 'Employment Details' }),
    expectedAttributeId: 'experience.position',
    platform: 'generic',
  },
  {
    id: 'TC-030',
    description: 'Workplace/firm variation',
    descriptor: fd({ label: 'Firm', name: 'firm_name', id: 'firm', placeholder: 'Company or firm name', parentSection: 'Employment' }),
    expectedAttributeId: 'experience.company',
    platform: 'generic',
  },

  // ── EDUCATION (31–37) ─────────────────────────────────────────────────────
  {
    id: 'TC-031',
    description: 'University name field',
    descriptor: fd({ label: 'University / School', name: 'school', id: 'school-name', placeholder: 'e.g. MIT', parentSection: 'Education' }),
    expectedAttributeId: 'education.school',
    platform: 'greenhouse',
  },
  {
    id: 'TC-032',
    description: 'Degree field',
    descriptor: fd({ label: 'Degree', name: 'degree', id: 'degree-select', parentSection: 'Education' }),
    expectedAttributeId: 'education.degree',
    platform: 'greenhouse',
  },
  {
    id: 'TC-033',
    description: 'Major / field of study',
    descriptor: fd({ label: 'Major / Field of Study', name: 'discipline', id: 'major-field', placeholder: 'e.g. Computer Science', parentSection: 'Education' }),
    expectedAttributeId: 'education.fieldOfStudy',
    platform: 'greenhouse',
  },
  {
    id: 'TC-034',
    description: 'Institution name variation',
    descriptor: fd({ label: 'Institution Name', name: 'institution', id: 'edu-institution', parentSection: 'Academic Background' }),
    expectedAttributeId: 'education.school',
    platform: 'workday',
  },
  {
    id: 'TC-035',
    description: 'College name variation',
    descriptor: fd({ label: 'College', name: 'college', id: 'college-name', nearbyText: 'Education History' }),
    expectedAttributeId: 'education.school',
    platform: 'generic',
  },
  {
    id: 'TC-036',
    description: 'Qualification variation',
    descriptor: fd({ label: 'Qualification', name: 'qualification', id: 'qual', parentSection: 'Education' }),
    expectedAttributeId: 'education.degree',
    platform: 'generic',
  },
  {
    id: 'TC-037',
    description: 'Specialization variation',
    descriptor: fd({ label: 'Specialization', name: 'specialization', id: 'spec-field', parentSection: 'Education Details' }),
    expectedAttributeId: 'education.fieldOfStudy',
    platform: 'generic',
  },

  // ── PREFERENCES (38–42) ───────────────────────────────────────────────────
  {
    id: 'TC-038',
    description: 'Expected salary field',
    descriptor: fd({ label: 'Expected Salary', name: 'salary', id: 'salary-expectation', placeholder: 'e.g. $80,000', parentSection: 'Preferences' }),
    expectedAttributeId: 'preference.salary',
    platform: 'generic',
  },
  {
    id: 'TC-039',
    description: 'Years of experience field',
    descriptor: fd({ label: 'Years of Experience', name: 'years_of_experience', id: 'yoe', inputType: 'number' }),
    expectedAttributeId: 'preference.yearsOfExperience',
    platform: 'generic',
  },
  {
    id: 'TC-040',
    description: 'Desired compensation variation',
    descriptor: fd({ label: 'Desired Compensation', name: 'compensation', id: 'comp-range', placeholder: 'Annual compensation' }),
    expectedAttributeId: 'preference.salary',
    platform: 'indeed',
  },
  {
    id: 'TC-041',
    description: 'Total experience variation',
    descriptor: fd({ label: 'Total Professional Experience', name: 'total_experience', id: 'total-exp', inputType: 'number', nearbyText: 'How many years of experience do you have?' }),
    expectedAttributeId: 'preference.yearsOfExperience',
    platform: 'workday',
  },
  {
    id: 'TC-042',
    description: 'Salary range field',
    descriptor: fd({ label: 'Salary Range', name: 'salary_range', id: 'expected-ctc', parentSection: 'Compensation' }),
    expectedAttributeId: 'preference.salary',
    platform: 'generic',
  },

  // ── IDENTITY / EEO (43–45) ────────────────────────────────────────────────
  {
    id: 'TC-043',
    description: 'Gender identity field',
    descriptor: fd({ label: 'Gender', name: 'gender', id: 'gender-select', parentSection: 'Voluntary Self-Identification' }),
    expectedAttributeId: 'identity.gender',
    platform: 'workday',
  },
  {
    id: 'TC-044',
    description: 'Veteran status field',
    descriptor: fd({ label: 'Veteran Status', name: 'veteran_status', id: 'veteran-select', parentSection: 'Voluntary Self-Identification' }),
    expectedAttributeId: 'identity.veteranStatus',
    platform: 'workday',
  },
  {
    id: 'TC-045',
    description: 'Gender with aria-label only',
    descriptor: fd({ ariaLabel: 'Gender Identity', name: 'eeo_gender', id: 'eeo-1', parentSection: 'EEO Information' }),
    expectedAttributeId: 'identity.gender',
    platform: 'greenhouse',
  },

  // ── EDGE CASES / CHALLENGING (46–50) ──────────────────────────────────────
  {
    id: 'TC-046',
    description: 'Ambiguous "name" field in context',
    descriptor: fd({ label: 'Name', name: 'applicant_name', id: 'name-field', placeholder: 'Your full name', parentSection: 'Applicant Details', formContext: 'Job Application', isRequired: true }),
    expectedAttributeId: 'name',
    platform: 'generic',
  },
  {
    id: 'TC-047',
    description: 'GitHub profile via placeholder only',
    descriptor: fd({ label: '', name: 'social_link_2', id: 'social-2', placeholder: 'GitHub profile URL', inputType: 'url' }),
    expectedAttributeId: 'githubUrl',
    platform: 'generic',
  },
  {
    id: 'TC-048',
    description: 'Address field (maps to location)',
    descriptor: fd({ label: 'Street Address', name: 'address', id: 'street-address', placeholder: '123 Main St', parentSection: 'Address Information' }),
    expectedAttributeId: 'personalInfo.location',
    platform: 'workday',
  },
  {
    id: 'TC-049',
    description: 'E-mail ID variation (Indian English)',
    descriptor: fd({ label: 'E-Mail ID', name: 'email_id', id: 'email-id', inputType: 'email', parentSection: 'Contact Details' }),
    expectedAttributeId: 'email',
    platform: 'generic',
  },
  {
    id: 'TC-050',
    description: 'Nearby text only hint for phone',
    descriptor: fd({ label: '', name: 'field_3', id: 'input-3', inputType: 'tel', nearbyText: 'Contact Number', parentSection: 'Contact' }),
    expectedAttributeId: 'personalInfo.phone',
    platform: 'generic',
  },
];
