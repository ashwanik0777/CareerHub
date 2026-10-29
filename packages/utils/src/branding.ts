export interface BrandingConfig {
  name: string;
  shortName: string;
  description: string;
  companyName: string;
  domain: string;
  supportEmail: string;
  extensionName: string;
  extensionDescription: string;
  developerApiTitle: string;
  adminTitle: string;
  metaTitleSuffix: string;
}

export const BRANDING: BrandingConfig = {
  name: 'CareerHub',
  shortName: 'CareerHub',
  description: 'A centralized professional identity platform to manage and reuse your profile across platforms.',
  companyName: 'CareerHub SaaS Platform Inc.',
  domain: 'careerhub.com',
  supportEmail: 'support@careerhub.com',
  extensionName: 'CareerHub Browser Autofill',
  extensionDescription: 'Intelligently auto-fills job application forms using your centralized profile.',
  developerApiTitle: 'Developer Gateway',
  adminTitle: 'Admin Console',
  metaTitleSuffix: ' | Centralized Professional Identity Platform',
};
