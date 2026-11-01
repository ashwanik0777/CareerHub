import { cache } from 'react';
import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { prisma } from '@platform/db';

/**
 * Signing key, resolved on first use rather than at import time: `next build`
 * imports every route to collect page data, and the secret is a runtime-only
 * value (CI and Docker builds do not have it). There is still no fallback —
 * any sign/verify without a valid secret throws, so auth fails closed.
 */
let cachedKey: Uint8Array | null = null;
function getKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET environment variable is required (min 32 chars). Set it in .env (see .env.example).');
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  const key = getKey(); // outside try: a misconfigured secret must surface as an error, not as "logged out"
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

async function readSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get('session_token')?.value;
  if (fromCookie) return fromCookie;

  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return undefined;
}

/**
 * Resolves the current session. Wrapped in React `cache()` so that a layout,
 * its page and any server components rendered in the same request share one
 * JWT verification and one Session-table read instead of repeating them.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const sessionToken = await readSessionToken();
  if (!sessionToken) return null;

  const payload = await decrypt(sessionToken);
  if (!payload) return null;

  // Verify in database that session exists and is active (allows revocation).
  const dbSession = await prisma.session.findUnique({
    where: { token: sessionToken },
    select: { expiresAt: true },
  });

  if (!dbSession || dbSession.expiresAt < new Date()) {
    return null;
  }

  return payload;
});

/**
 * Current user's DB row (role etc.), shared per request like getSession().
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
});

export async function createSession(userId: string, email: string, name: string, userAgent?: string, ipAddress?: string) {
  const payload: SessionPayload = { userId, email, name };
  const token = await encrypt(payload);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent: userAgent?.slice(0, 512),
      ipAddress: ipAddress?.slice(0, 64),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Ends the current session (cookie or Bearer token) and clears the cookie.
 */
export async function deleteSession() {
  const token = await readSessionToken();

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  const cookieStore = await cookies();
  cookieStore.delete('session_token');
}

/**
 * Revokes every session of a user except the one making the request.
 * Used after password changes so a stolen token cannot outlive the change.
 */
export async function revokeOtherSessions(userId: string) {
  const current = await readSessionToken();
  await prisma.session.deleteMany({
    where: current ? { userId, token: { not: current } } : { userId },
  });
}

/**
 * Opportunistic cleanup: drops this user's expired sessions. Called on login so
 * the Session table does not grow without bound (no cron needed).
 */
export async function purgeExpiredSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });
}

/** Request metadata captured for the Session/AuditLog rows. */
export function getRequestMeta(request: Request): { userAgent?: string; ipAddress?: string } {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress,
  };
}
