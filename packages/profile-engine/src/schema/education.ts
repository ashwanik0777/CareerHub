import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const EducationSchema = BaseEntitySchema.extend({
  institutionName: z.string().min(1),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.string().optional(),
  maxGpa: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  activities: z.array(z.string()).optional(),
});

export type Education = z.infer<typeof EducationSchema>;
