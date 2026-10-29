import { z } from 'zod';

export const resumeSchema = z.object({
  title: z.string().min(1, 'Resume title is required').max(100),
  targetRole: z.string().max(100).nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
  isDefault: z.boolean().default(false),
  structure: z.object({
    experiences: z.array(z.string()), // Array of experience IDs
    educations: z.array(z.string()),   // Array of education IDs
    projects: z.array(z.string()),     // Array of project IDs
    skills: z.array(z.string()),       // Array of skill IDs
    certifications: z.array(z.string()), // Array of certification IDs
    awards: z.array(z.string()),       // Array of award IDs
    languages: z.array(z.string()),    // Array of language IDs
  }),
});

export type ResumeInput = z.infer<typeof resumeSchema>;
