import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const SkillSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  level: z.string().optional(), // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  category: z.string().optional(), // 'Programming Languages', 'Frameworks', 'Tools'
  yearsOfExperience: z.number().min(0).optional(),
});

export type Skill = z.infer<typeof SkillSchema>;
