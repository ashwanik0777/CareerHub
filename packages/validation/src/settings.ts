import { z } from 'zod';

export const accountSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'CONNECTED']).default('PUBLIC'),
  themePreference: z.string().max(20).default('dark'),
  languagePreference: z.string().max(10).default('en'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
