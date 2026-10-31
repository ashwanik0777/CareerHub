import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * API keys and OAuth secrets are high-entropy random strings, so a plain
 * SHA-256 (no salt, no stretching) is the right primitive: it is cheap enough
 * for a per-request lookup and a database leak still yields nothing usable.
 * (bcrypt is for low-entropy human passwords, not 192-bit random tokens.)
 */
export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex');
}

/** Constant-time comparison of two hex digests. */
export function secretMatches(secret: string, storedHash: string): boolean {
  const a = Buffer.from(hashSecret(secret), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function generateApiKey(): string {
  return `chk_${randomBytes(24).toString('hex')}`;
}

export function generateOauthAccessToken(): string {
  return `oat_${randomBytes(32).toString('hex')}`;
}

export function generateClientSecret(): string {
  return randomBytes(32).toString('hex');
}

export function generateOpaqueCode(): string {
  return randomBytes(24).toString('base64url');
}
