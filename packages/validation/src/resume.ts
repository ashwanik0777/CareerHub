import { z } from 'zod';

const uuid = z.string().uuid('Invalid id');
const idList = z.array(uuid).max(100, 'Too many items');

export const resumeSchema = z.object({
  title: z.string().trim().min(1, 'Resume title is required').max(100),
  targetRole: z.string().max(100).nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
  isDefault: z.boolean().default(false),
  structure: z.object({
    experiences: idList,     // Experience IDs
    educations: idList,      // Education IDs
    projects: idList,        // Project IDs
    skills: idList,          // Skill IDs
    certifications: idList,  // Certification IDs
    awards: idList,          // Award IDs
    languages: idList,       // Language IDs
  }),
});

export const profileVariantSchema = z.object({
  scenario: z.string().trim().min(1, 'Required').max(50),
  targetRole: z.string().trim().min(1, 'Required').max(100),
});

export type ResumeInput = z.infer<typeof resumeSchema>;
export type ProfileVariantInput = z.infer<typeof profileVariantSchema>;
