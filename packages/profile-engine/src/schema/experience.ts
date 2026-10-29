import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const ExperienceSchema = BaseEntitySchema.extend({
  companyName: z.string().min(1),
  title: z.string().min(1),
  employmentType: z.string().optional(), // 'Full-time', 'Part-time', 'Contract', etc.
  location: z.string().optional(),
  locationType: z.string().optional(), // 'Remote', 'On-site', 'Hybrid'
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  industry: z.string().optional(),
});

export type Experience = z.infer<typeof ExperienceSchema>;
