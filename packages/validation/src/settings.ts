import { z } from 'zod';
import { passwordField } from './common';

export const accountSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'CONNECTED']).default('PUBLIC'),
  themePreference: z.enum(['dark', 'light']).default('dark'),
  languagePreference: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code').default('en'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: passwordField('New password'),
    confirmPassword: z.string().min(1, 'Please confirm your new password').max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must differ from the current password',
    path: ['newPassword'],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account').max(128),
});

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
