import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const PersonalSchema = BaseEntitySchema.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  preferredName: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
});

export type Personal = z.infer<typeof PersonalSchema>;
