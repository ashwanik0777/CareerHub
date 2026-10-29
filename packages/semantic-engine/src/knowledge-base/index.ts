// ────────────────────────────────────────────────────────────────────────────
// Knowledge Base — Site-Specific Field Mappings
// ────────────────────────────────────────────────────────────────────────────
// Hand-curated mappings for major ATS platforms. These act as deterministic
// overrides when the engine detects a known recruitment platform, providing
// near-perfect accuracy for common field patterns.
// ────────────────────────────────────────────────────────────────────────────

import { MappingSource } from '@platform/types';

/**
 * A single site-specific field mapping.
 */
export interface SiteFieldMapping {
  /** CSS selector, name attribute, or id pattern to match */
  selector: string;
  /** The ontology attribute this field maps to */
  attributeId: string;
  /** Override confidence for this mapping */
  confidence: number;
}

/**
 * Complete mapping configuration for a recruitment platform.
 */
export interface SiteMappingConfig {
  /** Platform identifier */
  platform: string;
  /** URL patterns to detect this platform */
  urlPatterns: RegExp[];
  /** Mapping source tag for telemetry */
  source: MappingSource;
  /** Field mappings for this platform */
  mappings: SiteFieldMapping[];
}

// ── Platform Configurations ────────────────────────────────────────────────

const GREENHOUSE_MAPPINGS: SiteMappingConfig = {
  platform: 'greenhouse',
  urlPatterns: [/greenhouse\.io/i, /boards\.greenhouse/i],
  source: MappingSource.SITE_OVERRIDE,
  mappings: [
    { selector: 'first_name', attributeId: 'personalInfo.firstName', confidence: 0.98 },
    { selector: 'last_name', attributeId: 'personalInfo.lastName', confidence: 0.98 },
    { selector: 'email', attributeId: 'email', confidence: 0.98 },
    { selector: 'phone', attributeId: 'personalInfo.phone', confidence: 0.98 },
    { selector: 'resume', attributeId: 'resume_file', confidence: 0.98 },
    { selector: 'resume_text', attributeId: 'resume_file', confidence: 0.95 },
    { selector: 'cover_letter', attributeId: 'personalInfo.bio', confidence: 0.90 },
    { selector: 'linkedin_profile', attributeId: 'linkedinUrl', confidence: 0.98 },
    { selector: 'website', attributeId: 'websiteUrl', confidence: 0.95 },
    { selector: 'location', attributeId: 'personalInfo.location', confidence: 0.95 },
    { selector: 'school_name', attributeId: 'education.school', confidence: 0.95 },
    { selector: 'degree', attributeId: 'education.degree', confidence: 0.95 },
    { selector: 'discipline', attributeId: 'education.fieldOfStudy', confidence: 0.95 },
    { selector: 'company_name', attributeId: 'experience.company', confidence: 0.95 },
    { selector: 'title', attributeId: 'experience.position', confidence: 0.90 },
  ],
};

const LEVER_MAPPINGS: SiteMappingConfig = {
  platform: 'lever',
  urlPatterns: [/lever\.co/i, /jobs\.lever/i],
  source: MappingSource.SITE_OVERRIDE,
  mappings: [
    { selector: 'name', attributeId: 'name', confidence: 0.98 },
    { selector: 'email', attributeId: 'email', confidence: 0.98 },
    { selector: 'phone', attributeId: 'personalInfo.phone', confidence: 0.98 },
    { selector: 'org', attributeId: 'experience.company', confidence: 0.95 },
    { selector: 'urls[LinkedIn]', attributeId: 'linkedinUrl', confidence: 0.98 },
    { selector: 'urls[GitHub]', attributeId: 'githubUrl', confidence: 0.98 },
    { selector: 'urls[Portfolio]', attributeId: 'websiteUrl', confidence: 0.95 },
    { selector: 'urls[Twitter]', attributeId: 'twitterUrl', confidence: 0.90 },
    { selector: 'resume', attributeId: 'resume_file', confidence: 0.98 },
    { selector: 'comments', attributeId: 'personalInfo.bio', confidence: 0.85 },
    { selector: 'cards[school]', attributeId: 'education.school', confidence: 0.95 },
    { selector: 'cards[degree]', attributeId: 'education.degree', confidence: 0.95 },
  ],
};

const WORKDAY_MAPPINGS: SiteMappingConfig = {
  platform: 'workday',
  urlPatterns: [/myworkdayjobs\.com/i, /workday\.com/i, /wd\d+\.myworkdaysite/i],
  source: MappingSource.SITE_OVERRIDE,
  mappings: [
    { selector: 'legalNameSection_firstName', attributeId: 'personalInfo.firstName', confidence: 0.98 },
    { selector: 'legalNameSection_lastName', attributeId: 'personalInfo.lastName', confidence: 0.98 },
    { selector: 'emailAddress', attributeId: 'email', confidence: 0.98 },
    { selector: 'phoneNumber', attributeId: 'personalInfo.phone', confidence: 0.98 },
    { selector: 'addressSection_city', attributeId: 'personalInfo.location', confidence: 0.95 },
    { selector: 'addressSection_countryRegion', attributeId: 'personalInfo.location', confidence: 0.90 },
    { selector: 'resume', attributeId: 'resume_file', confidence: 0.98 },
    { selector: 'linkedInProfile', attributeId: 'linkedinUrl', confidence: 0.95 },
    { selector: 'school', attributeId: 'education.school', confidence: 0.95 },
    { selector: 'degree', attributeId: 'education.degree', confidence: 0.95 },
    { selector: 'fieldOfStudy', attributeId: 'education.fieldOfStudy', confidence: 0.95 },
    { selector: 'company', attributeId: 'experience.company', confidence: 0.95 },
    { selector: 'jobTitle', attributeId: 'experience.position', confidence: 0.95 },
    { selector: 'gender', attributeId: 'identity.gender', confidence: 0.95 },
    { selector: 'veteranStatus', attributeId: 'identity.veteranStatus', confidence: 0.95 },
    { selector: 'disabilityStatus', attributeId: 'identity.disabilityStatus', confidence: 0.95 },
  ],
};

const LINKEDIN_MAPPINGS: SiteMappingConfig = {
  platform: 'linkedin',
  urlPatterns: [/linkedin\.com/i],
  source: MappingSource.SITE_OVERRIDE,
  mappings: [
    { selector: 'first-name', attributeId: 'personalInfo.firstName', confidence: 0.98 },
    { selector: 'last-name', attributeId: 'personalInfo.lastName', confidence: 0.98 },
    { selector: 'email-address', attributeId: 'email', confidence: 0.98 },
    { selector: 'phone-number', attributeId: 'personalInfo.phone', confidence: 0.98 },
    { selector: 'headline', attributeId: 'personalInfo.headline', confidence: 0.95 },
    { selector: 'summary', attributeId: 'personalInfo.bio', confidence: 0.95 },
    { selector: 'location', attributeId: 'personalInfo.location', confidence: 0.95 },
    { selector: 'resume', attributeId: 'resume_file', confidence: 0.98 },
    { selector: 'company', attributeId: 'experience.company', confidence: 0.95 },
    { selector: 'title', attributeId: 'experience.position', confidence: 0.95 },
    { selector: 'school', attributeId: 'education.school', confidence: 0.95 },
    { selector: 'degree', attributeId: 'education.degree', confidence: 0.95 },
    { selector: 'field-of-study', attributeId: 'education.fieldOfStudy', confidence: 0.95 },
  ],
};

const INDEED_MAPPINGS: SiteMappingConfig = {
  platform: 'indeed',
  urlPatterns: [/indeed\.com/i, /indeed\.co/i],
  source: MappingSource.SITE_OVERRIDE,
  mappings: [
    { selector: 'firstName', attributeId: 'personalInfo.firstName', confidence: 0.98 },
    { selector: 'lastName', attributeId: 'personalInfo.lastName', confidence: 0.98 },
    { selector: 'email', attributeId: 'email', confidence: 0.98 },
    { selector: 'phoneNumber', attributeId: 'personalInfo.phone', confidence: 0.98 },
    { selector: 'location', attributeId: 'personalInfo.location', confidence: 0.95 },
    { selector: 'resume', attributeId: 'resume_file', confidence: 0.98 },
    { selector: 'indeed-resume', attributeId: 'resume_file', confidence: 0.95 },
    { selector: 'salary', attributeId: 'preference.salary', confidence: 0.90 },
    { selector: 'experience', attributeId: 'preference.yearsOfExperience', confidence: 0.85 },
  ],
};

const GENERIC_FALLBACK: SiteMappingConfig = {
  platform: 'generic',
  urlPatterns: [/.*/],
  source: MappingSource.SITE_OVERRIDE,
  mappings: [
    { selector: 'first_name', attributeId: 'personalInfo.firstName', confidence: 0.90 },
    { selector: 'last_name', attributeId: 'personalInfo.lastName', confidence: 0.90 },
    { selector: 'full_name', attributeId: 'name', confidence: 0.90 },
    { selector: 'email', attributeId: 'email', confidence: 0.90 },
    { selector: 'phone', attributeId: 'personalInfo.phone', confidence: 0.90 },
    { selector: 'resume', attributeId: 'resume_file', confidence: 0.90 },
    { selector: 'linkedin', attributeId: 'linkedinUrl', confidence: 0.90 },
    { selector: 'github', attributeId: 'githubUrl', confidence: 0.90 },
    { selector: 'website', attributeId: 'websiteUrl', confidence: 0.85 },
    { selector: 'company', attributeId: 'experience.company', confidence: 0.85 },
    { selector: 'school', attributeId: 'education.school', confidence: 0.85 },
    { selector: 'degree', attributeId: 'education.degree', confidence: 0.85 },
  ],
};

// ── Exported Knowledge Base ────────────────────────────────────────────────

/**
 * All site mapping configurations, ordered by specificity.
 * The generic fallback is always last and matches any URL.
 */
export const SITE_MAPPINGS: SiteMappingConfig[] = [
  GREENHOUSE_MAPPINGS,
  LEVER_MAPPINGS,
  WORKDAY_MAPPINGS,
  LINKEDIN_MAPPINGS,
  INDEED_MAPPINGS,
  GENERIC_FALLBACK,
];

/**
 * Detect which platform configuration matches a given URL.
 * Returns the first matching platform, or the generic fallback.
 */
export function detectPlatform(url: string): SiteMappingConfig {
  for (const config of SITE_MAPPINGS) {
    if (config.platform === 'generic') continue;
    if (config.urlPatterns.some(pattern => pattern.test(url))) {
      return config;
    }
  }
  return GENERIC_FALLBACK;
}

/**
 * Look up a site-specific mapping for a field by its selector/name/id.
 * Returns the mapping if found, or undefined.
 */
export function findSiteMapping(
  platform: SiteMappingConfig,
  fieldIdentifier: string,
): SiteFieldMapping | undefined {
  const normalized = fieldIdentifier.toLowerCase();
  return platform.mappings.find(
    m => normalized.includes(m.selector.toLowerCase()),
  );
}
