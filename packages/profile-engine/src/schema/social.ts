import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const SocialSchema = BaseEntitySchema.extend({
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  leetcode: z.string().url().optional(),
  otherUrls: z.array(z.string().url()).default([]),
});

export type Social = z.infer<typeof SocialSchema>;
