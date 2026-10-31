import { z } from 'zod';

/**
 * Shared primitives used across schemas.
 */

/** Only http(s) URLs: blocks `javascript:` / `data:` schemes that `z.string().url()` lets through. */
export const httpUrl = (message = 'Must be a valid http(s) URL') =>
  z
    .string()
    .max(2048, 'URL must be 2048 characters or less')
    .url(message)
    .refine((u) => /^https?:\/\//i.test(u), { message });

/** Optional http(s) URL that also accepts '' / null (form fields). */
export const optionalHttpUrl = (message?: string) =>
  httpUrl(message).or(z.literal('')).nullable().optional();

/** Trimmed, lower-cased email. */
export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email must be 254 characters or less')
  .email('Invalid email address')
  .transform((e) => e.toLowerCase());

/** Password policy shared by register and change-password. */
export const passwordField = (label = 'Password') =>
  z
    .string()
    .min(8, `${label} must be at least 8 characters`)
    .max(128, `${label} must be 128 characters or less`);

const emptyToNull = (val: unknown) => (val === '' || val === undefined ? null : val);

/**
 * Required date. Rejects null/undefined/'' and booleans instead of coercing
 * them to 1970-01-01 the way bare `z.coerce.date()` does.
 */
export const requiredDate = (message = 'Date is required') =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined || typeof val === 'boolean' ? undefined : val),
    z.coerce.date({ required_error: message, invalid_type_error: message })
  );

/** Optional date: '' / undefined / null → null; anything else must coerce to a valid date. */
export const optionalDate = () =>
  z.preprocess(
    (val) => (typeof val === 'boolean' ? NaN : emptyToNull(val)),
    z.coerce.date().nullable().optional()
  );

/** Non-negative integer from query strings; falls back to `def` when missing/invalid. */
export const queryInt = (def: number, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess(
    (v) => (v === null || v === undefined || v === '' ? def : Number(v)),
    z.number().int().min(0).max(max).catch(def)
  );
