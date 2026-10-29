import { z } from 'zod';
import { BaseEntitySchema } from './base';
import { PersonalSchema } from './personal';
import { ContactSchema } from './contact';
import { EducationSchema } from './education';
import { ExperienceSchema } from './experience';
import { ProjectSchema } from './projects';
import { SkillSchema } from './skills';
import { SocialSchema } from './social';

export const ProfessionalProfileSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  personal: PersonalSchema.optional(),
  contact: ContactSchema.optional(),
  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  social: SocialSchema.optional(),
  
  // Future extensions
  certificates: z.array(z.any()).default([]),
  research: z.array(z.any()).default([]),
  publications: z.array(z.any()).default([]),
  languages: z.array(z.any()).default([]),
  achievements: z.array(z.any()).default([]),
  preferences: z.any().optional(),
  availability: z.any().optional(),
  salary: z.any().optional(),
});

export type ProfessionalProfile = z.infer<typeof ProfessionalProfileSchema>;
