import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const ProjectSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isCurrent: z.boolean().default(false),
  technologies: z.array(z.string()).default([]),
  role: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
