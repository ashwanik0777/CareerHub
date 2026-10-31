// ────────────────────────────────────────────────────────────────────────────
// Website Rules — Enhanced with Knowledge Base Integration
// ────────────────────────────────────────────────────────────────────────────
// Defines site-specific rules for form detection and field mapping.
// Now includes LinkedIn Easy Apply and Indeed, with configurable backend URL.
// ────────────────────────────────────────────────────────────────────────────

export interface WebsiteRule {
  name: string;
  urlPattern: RegExp;
  selectors: {
    form?: string;
    inputs?: string;
    fileUpload?: string;
  };
  fieldOverrides?: Record<string, string>; // Maps specific CSS selector to profile field
}

export const SUPPORTED_WEBSITES: WebsiteRule[] = [
  {
    name: 'Greenhouse',
    urlPattern: /boards\.greenhouse\.io/i,
    selectors: {
      form: '#application_form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
    fieldOverrides: {
      '#first_name': 'personalInfo.firstName',
      '#last_name': 'personalInfo.lastName',
      '#email': 'email',
      '#phone': 'personalInfo.phone',
      '#job_application_answers_attributes_0_text_value': 'linkedinUrl',
      '#job_application_answers_attributes_1_text_value': 'githubUrl',
    },
  },
  {
    name: 'Lever',
    urlPattern: /jobs\.lever\.co/i,
    selectors: {
      form: '#application-form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
    fieldOverrides: {
      'input[name="name"]': 'name',
      'input[name="email"]': 'email',
      'input[name="phone"]': 'personalInfo.phone',
      'input[name="org"]': 'experience.company',
      'input[name="urls[LinkedIn]"]': 'linkedinUrl',
      'input[name="urls[GitHub]"]': 'githubUrl',
      'input[name="urls[Portfolio]"]': 'websiteUrl',
    },
  },
  {
    name: 'Workday',
    urlPattern: /myworkdayjobs\.com/i,
    selectors: {
      form: 'form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
  },
  {
    name: 'LinkedIn Easy Apply',
    urlPattern: /linkedin\.com\/jobs/i,
    selectors: {
      form: '.jobs-easy-apply-content form, form.jobs-apply-form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
    fieldOverrides: {
      'input[id*="first-name"]': 'personalInfo.firstName',
      'input[id*="last-name"]': 'personalInfo.lastName',
      'input[id*="email"]': 'email',
      'input[id*="phone"]': 'personalInfo.phone',
      'input[id*="city"]': 'personalInfo.location',
    },
  },
  {
    name: 'Indeed',
    urlPattern: /indeed\.com/i,
    selectors: {
      form: 'form[id*="apply"], form.ia-Resume',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
    fieldOverrides: {
      'input[id="input-firstName"]': 'personalInfo.firstName',
      'input[id="input-lastName"]': 'personalInfo.lastName',
      'input[id="input-email"]': 'email',
      'input[id="input-phoneNumber"]': 'personalInfo.phone',
      'input[id="input-location"]': 'personalInfo.location',
    },
  },
  {
    name: 'Internshala',
    urlPattern: /internshala\.com/i,
    selectors: {
      form: 'form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
    fieldOverrides: {
      'input[name="first_name"]': 'personalInfo.firstName',
      'input[name="last_name"]': 'personalInfo.lastName',
      'input[name="email"]': 'email',
      'input[name="phone"]': 'personalInfo.phone',
      'input[name="location"]': 'personalInfo.location',
    },
  },
  {
    name: 'Naukri',
    urlPattern: /naukri\.com/i,
    selectors: {
      form: 'form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
  },
];

/**
 * Detect which website rule matches the given URL.
 * Returns a matching rule or a generic fallback.
 */
export function detectWebsite(url: string): WebsiteRule | null {
  for (const site of SUPPORTED_WEBSITES) {
    if (site.urlPattern.test(url)) {
      return site;
    }
  }
  
  // Return a generic rule for unsupported sites to attempt heuristic autofill anyway
  return {
    name: 'Generic Form',
    urlPattern: /.*/,
    selectors: {
      form: 'form',
      inputs: 'input, textarea, select',
      fileUpload: 'input[type="file"]',
    },
  };
}

// Backend URL configuration lives in ./backend-config (validated, single source).
export { getBackendUrl, DEFAULT_BACKEND_URL } from './backend-config';

/** True when the URL belongs to a site with dedicated rules (not the generic fallback). */
export function isSupportedWebsite(url: string): boolean {
  return SUPPORTED_WEBSITES.some((site) => site.urlPattern.test(url));
}
