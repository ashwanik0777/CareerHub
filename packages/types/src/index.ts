// Centralize all shared interfaces/types

export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum LanguageProficiency {
  ELEMENTARY = 'ELEMENTARY',
  LIMITED = 'LIMITED',
  PROFESSIONAL = 'PROFESSIONAL',
  FULL_PROFESSIONAL = 'FULL_PROFESSIONAL',
  NATIVE = 'NATIVE',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  CONNECTED = 'CONNECTED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  preferredLocation?: string | null;
  availability?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  experiences?: Experience[];
  educations?: Education[];
  projects?: Project[];
  skills?: Skill[];
  certifications?: Certification[];
  awards?: Award[];
  languages?: Language[];
}

export interface Experience {
  id: string;
  profileId: string;
  company: string;
  position: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  type: JobType;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  profileId: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  grade?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  profileId: string;
  title: string;
  description: string;
  url?: string | null;
  githubUrl?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  technologies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  level: SkillLevel;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Award {
  id: string;
  profileId: string;
  title: string;
  issuer: string;
  date: Date;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  id: string;
  profileId: string;
  name: string;
  proficiency: LanguageProficiency;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  targetRole?: string | null;
  summary?: string | null;
  isDefault: boolean;
  structure: any; // Contains lists of IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AccountSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  profileVisibility: Visibility;
  themePreference: string;
  languagePreference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, string[]>;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Semantic Engine Types
// ────────────────────────────────────────────────────────────────────────────


/** Confidence level classification for semantic predictions. */
export enum ConfidenceLevel {
  HIGH = 'HIGH',       // >= 0.85 — auto-fill eligible
  MEDIUM = 'MEDIUM',   // 0.60 – 0.84 — confirmation required
  LOW = 'LOW',         // < 0.60 — manual verification needed
}

/** Source of a semantic field mapping prediction. */
export enum MappingSource {
  RULE_ENGINE = 'RULE_ENGINE',
  KEYWORD_MATCH = 'KEYWORD_MATCH',
  SEMANTIC_SIMILARITY = 'SEMANTIC_SIMILARITY',
  SITE_OVERRIDE = 'SITE_OVERRIDE',
  AI_REASONING = 'AI_REASONING',
  MANUAL = 'MANUAL',
}

/** Rich descriptor for a detected form field, extracted from DOM analysis. */
export interface DetectedFieldDescriptor {
  /** HTML element tag name (INPUT, TEXTAREA, SELECT) */
  tagName: string;
  /** Input type attribute (text, email, tel, file, etc.) */
  inputType: string;
  /** Extracted label text from associated <label>, aria, or nearby elements */
  label: string;
  /** Placeholder attribute value */
  placeholder: string;
  /** HTML name attribute */
  name: string;
  /** HTML id attribute */
  id: string;
  /** aria-label attribute value */
  ariaLabel: string;
  /** title attribute value */
  title: string;
  /** Text from nearby headings, legends, or section titles */
  nearbyText: string;
  /** Parent section or fieldset context */
  parentSection: string;
  /** Simplified DOM hierarchy path */
  domPath: string;
  /** Form-level context (form id, action, heading) */
  formContext: string;
  /** Whether the field is required */
  isRequired: boolean;
  /** Validation pattern if present */
  validationPattern: string;
}

/** A single prediction mapping a form field to a profile ontology attribute. */
export interface FieldPrediction {
  /** Ontology attribute ID (e.g., 'personalInfo.firstName') */
  attributeId: string;
  /** Confidence score between 0 and 1 */
  confidence: number;
  /** Classified confidence level */
  confidenceLevel: ConfidenceLevel;
  /** Which mapping strategy produced this prediction */
  source: MappingSource;
  /** Human-readable reasoning for the prediction */
  reasoning: string;
  /** Alternative predictions that were considered */
  alternativeMappings?: Array<{ attributeId: string; confidence: number; source: MappingSource }>;
}

/** Structured telemetry event generated per autofill operation. */
export interface AutofillTelemetryEvent {
  /** Unique session identifier */
  sessionId: string;
  /** Recruitment platform name */
  platform: string;
  /** Page URL where autofill was executed */
  pageUrl: string;
  /** Timestamp of the autofill execution */
  timestamp: string;
  /** Total form fields detected on the page */
  totalFields: number;
  /** Fields successfully filled */
  filledFields: number;
  /** Fields skipped due to low confidence */
  skippedFields: number;
  /** Count of fields at each confidence level */
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  /** Average confidence across all predictions */
  avgConfidence: number;
  /** Total execution time in milliseconds */
  executionTimeMs: number;
  /** Per-field detailed telemetry */
  fieldDetails: Array<{
    fieldDescriptor: Partial<DetectedFieldDescriptor>;
    prediction: FieldPrediction | null;
    wasFilled: boolean;
    userCorrected: boolean;
  }>;
}

/** Result of a benchmarking experiment run. */
export interface ExperimentResult {
  /** Experiment name */
  name: string;
  /** Strategy being evaluated */
  strategy: string;
  /** Dataset size used */
  datasetSize: number;
  /** Standard IR metrics */
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  /** Performance metrics */
  avgInferenceTimeMs: number;
  /** Configuration used */
  configuration: Record<string, unknown>;
  /** Per-field detailed results */
  detailedResults: Array<{
    fieldId: string;
    expectedAttributeId: string;
    predictedAttributeId: string;
    confidence: number;
    correct: boolean;
    inferenceTimeMs: number;
  }>;
}

/** Configuration for a structured profile variant (resume tailored for a scenario). */
export interface ProfileVariantConfig {
  /** Variant name */
  name: string;
  /** Target role */
  targetRole: string;
  /** Application scenario */
  scenario: 'general' | 'internship' | 'swe' | 'research' | 'ai' | 'data_science' | 'frontend' | 'backend' | 'fullstack';
  /** Selected experience IDs */
  experienceIds: string[];
  /** Selected education IDs */
  educationIds: string[];
  /** Selected project IDs */
  projectIds: string[];
  /** Selected skill IDs */
  skillIds: string[];
  /** Selected certification IDs */
  certificationIds: string[];
  /** Selected award IDs */
  awardIds: string[];
  /** Custom summary for this variant */
  customSummary?: string;
  /** Custom headline for this variant */
  customHeadline?: string;
}

// Re-export ontology types (SemanticCategory is canonical in ontology.ts)
export type { OntologyAttribute } from './ontology';
export { SemanticCategory, PROFILE_ONTOLOGY, getOntologyAttribute, getAttributesByCategory, getOntologySize } from './ontology';

