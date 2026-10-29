/** The 20 model output classes, alphabetically sorted. */
export const MODEL_CLASSES = [
  'availability.expected_salary',
  'contact.address_city',
  'contact.address_country',
  'contact.address_state',
  'contact.address_zip',
  'contact.email',
  'contact.phone_number',
  'education.college',
  'education.degree',
  'education.gpa',
  'experience.company_name',
  'experience.job_title',
  'miscellaneous',
  'personal.first_name',
  'personal.full_name',
  'personal.last_name',
  'resume.upload_field',
  'social.github',
  'social.linkedin',
  'social.portfolio',
] as const;

export const MISCELLANEOUS_CLASS = 'miscellaneous';

/**
 * Maps model output classes to canonical professional profile ontology attribute IDs.
 * Classes mapping to null represent non-matches (abstained predictions).
 */
export const CLASS_TO_ATTRIBUTE: Record<string, string | null> = {
  'availability.expected_salary': 'preference.salary',
  'contact.address_city': 'personalInfo.location',
  'contact.address_country': 'personalInfo.location',
  'contact.address_state': 'personalInfo.location',
  'contact.address_zip': 'personalInfo.location',
  'contact.email': 'email',
  'contact.phone_number': 'personalInfo.phone',
  'education.college': 'education.school',
  'education.degree': 'education.degree',
  'education.gpa': 'education.grade',
  'experience.company_name': 'experience.company',
  'experience.job_title': 'experience.position',
  'miscellaneous': null,
  'personal.first_name': 'personalInfo.firstName',
  'personal.last_name': 'personalInfo.lastName',
  'personal.full_name': 'name',
  'resume.upload_field': 'resume_file',
  'social.github': 'githubUrl',
  'social.linkedin': 'linkedinUrl',
  'social.portfolio': 'websiteUrl',
};
