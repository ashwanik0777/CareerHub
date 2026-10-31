import { z } from 'zod';
import { optionalHttpUrl, requiredDate, optionalDate } from './common';

export const personalInfoSchema = z.object({
  headline: z.string().max(200, 'Headline must be 200 characters or less').nullable().optional(),
  bio: z.string().max(2000, 'Biography must be 2000 characters or less').nullable().optional(),
  location: z.string().max(100, 'Location must be 100 characters or less').nullable().optional(),
  preferredLocation: z.string().max(100, 'Preferred location must be 100 characters or less').nullable().optional(),
  availability: z.string().max(100, 'Availability must be 100 characters or less').nullable().optional(),
  websiteUrl: optionalHttpUrl('Invalid website URL'),
  githubUrl: optionalHttpUrl('Invalid GitHub URL'),
  linkedinUrl: optionalHttpUrl('Invalid LinkedIn URL'),
  // Identity & contact fields job portals ask for during applications
  firstName: z.string().max(100, 'First name must be 100 characters or less').nullable().optional(),
  lastName: z.string().max(100, 'Last name must be 100 characters or less').nullable().optional(),
  phone: z.string().max(30, 'Phone must be 30 characters or less').nullable().optional(),
  alternatePhone: z.string().max(30, 'Alternate phone must be 30 characters or less').nullable().optional(),
  alternateEmail: z.string().trim().max(254).email('Invalid email').or(z.literal('')).nullable().optional(),
  dateOfBirth: z.string().max(20, 'Date of birth must be 20 characters or less').nullable().optional(),
  gender: z.string().max(30, 'Gender must be 30 characters or less').nullable().optional(),
  nationality: z.string().max(100, 'Nationality must be 100 characters or less').nullable().optional(),
  maritalStatus: z.string().max(50, 'Marital status must be 50 characters or less').nullable().optional(),
  category: z.string().max(50, 'Category must be 50 characters or less').nullable().optional(),
  disabilityStatus: z.string().max(100, 'Disability status must be 100 characters or less').nullable().optional(),
  passportNumber: z.string().max(50, 'Passport number must be 50 characters or less').nullable().optional(),
  addressLine: z.string().max(300, 'Address must be 300 characters or less').nullable().optional(),
  addressCity: z.string().max(100, 'City must be 100 characters or less').nullable().optional(),
  addressDistrict: z.string().max(100, 'District must be 100 characters or less').nullable().optional(),
  addressState: z.string().max(100, 'State must be 100 characters or less').nullable().optional(),
  addressCountry: z.string().max(100, 'Country must be 100 characters or less').nullable().optional(),
  addressZip: z.string().max(20, 'ZIP/PIN must be 20 characters or less').nullable().optional(),
  totalExperience: z.string().max(50, 'Total experience must be 50 characters or less').nullable().optional(),
  currentSalary: z.string().max(50, 'Current salary must be 50 characters or less').nullable().optional(),
  expectedSalary: z.string().max(50, 'Expected salary must be 50 characters or less').nullable().optional(),
  noticePeriod: z.string().max(50, 'Notice period must be 50 characters or less').nullable().optional(),
  workAuthorization: z.string().max(100, 'Work authorization must be 100 characters or less').nullable().optional(),
  twitterUrl: optionalHttpUrl('Invalid Twitter/X URL'),
  portfolioUrl: optionalHttpUrl('Invalid Portfolio URL'),
});

export const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  position: z.string().min(1, 'Position title is required').max(100),
  location: z.string().max(100).nullable().optional(),
  startDate: requiredDate('Start date is required'),
  endDate: optionalDate(),
  isCurrent: z.boolean().default(false),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).default('FULL_TIME'),
  description: z.string().max(2000).nullable().optional(),
}).refine((data) => {
  if (!data.isCurrent && !data.endDate) {
    return false;
  }
  if (data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'End date is required when not currently working, and must be after start date',
  path: ['endDate'],
});

export const educationSchema = z.object({
  school: z.string().min(1, 'School name is required').max(100),
  degree: z.string().min(1, 'Degree is required').max(100),
  fieldOfStudy: z.string().min(1, 'Field of study is required').max(100),
  startDate: requiredDate('Start date is required'),
  endDate: optionalDate(),
  isCurrent: z.boolean().default(false),
  grade: z.string().max(20).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
}).refine((data) => {
  if (!data.isCurrent && !data.endDate) {
    return false;
  }
  if (data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'End date is required when not currently studying, and must be after start date',
  path: ['endDate'],
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  url: optionalHttpUrl('Invalid project URL'),
  githubUrl: optionalHttpUrl('Invalid GitHub URL'),
  startDate: optionalDate(),
  endDate: optionalDate(),
  technologies: z.array(z.string().trim().min(1).max(50)).max(30, 'At most 30 technologies').default([]),
}).refine((data) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  category: z.string().max(50).nullable().optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  issueDate: requiredDate('Issue date is required'),
  expiryDate: optionalDate(),
  credentialId: z.string().max(100).nullable().optional(),
  credentialUrl: optionalHttpUrl('Invalid credential URL'),
}).refine((data) => {
  if (data.issueDate && data.expiryDate && data.issueDate > data.expiryDate) {
    return false;
  }
  return true;
}, {
  message: 'Expiry date must be after issue date',
  path: ['expiryDate'],
});

export const awardSchema = z.object({
  title: z.string().min(1, 'Award title is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  date: requiredDate('Date received is required'),
  description: z.string().max(1000).nullable().optional(),
});

export const languageSchema = z.object({
  name: z.string().min(1, 'Language name is required').max(50),
  proficiency: z.enum(['ELEMENTARY', 'LIMITED', 'PROFESSIONAL', 'FULL_PROFESSIONAL', 'NATIVE']).default('PROFESSIONAL'),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type AwardInput = z.infer<typeof awardSchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
