import { z } from 'zod';
import { BaseEntitySchema } from './base';

export const ContactSchema = BaseEntitySchema.extend({
  email: z.string().email(),
  secondaryEmail: z.string().email().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;
