import { z } from 'zod';
import { emailField, passwordField } from './common';

export const loginSchema = z.object({
  email: emailField,
  // Login only checks shape; the real policy is enforced at registration.
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  email: emailField,
  password: passwordField(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
