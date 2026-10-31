import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Fail closed: a missing secret must never silently fall back to a public value.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET environment variable is required (min 32 chars). Set it in .env (see .env.example).');
}
const key = new TextEncoder().encode(JWT_SECRET);

// ────────────────────────────────────────────────────────────────────────────
// In-memory token-bucket rate limiter.
// NOTE: state is per server instance. Behind multiple replicas use a shared
// store (Redis) instead; this still stops single-origin abuse per node.
// ────────────────────────────────────────────────────────────────────────────
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitPolicy {
  capacity: number;        // burst size
  refillPerSecond: number; // sustained rate
}

// General API traffic: 100 burst, 2/s sustained.
const API_POLICY: RateLimitPolicy = { capacity: 100, refillPerSecond: 2 };
// Credential endpoints: 10 attempts burst, then 1 every 6 s (~10/min) per IP.
const AUTH_POLICY: RateLimitPolicy = { capacity: 10, refillPerSecond: 1 / 6 };

const MAX_TRACKED_KEYS = 10_000;
const BUCKET_IDLE_TTL_MS = 10 * 60 * 1000;
const rateLimitMap = new Map<string, RateLimitBucket>();
let lastSweep = Date.now();

function sweepIdleBuckets(now: number) {
  // Sweep at most once a minute, or immediately when the map is at capacity.
  if (now - lastSweep < 60_000 && rateLimitMap.size < MAX_TRACKED_KEYS) return;
  lastSweep = now;
  for (const [k, b] of rateLimitMap) {
    if (now - b.lastRefill > BUCKET_IDLE_TTL_MS) rateLimitMap.delete(k);
  }
  // Still full (burst of distinct IPs): drop the oldest entries.
  if (rateLimitMap.size >= MAX_TRACKED_KEYS) {
    const excess = rateLimitMap.size - MAX_TRACKED_KEYS + 1;
    let i = 0;
    for (const k of rateLimitMap.keys()) {
      if (i++ >= excess) break;
      rateLimitMap.delete(k);
    }
  }
}

function isRateLimited(bucketKey: string, policy: RateLimitPolicy): boolean {
  const now = Date.now();
  sweepIdleBuckets(now);

  let bucket = rateLimitMap.get(bucketKey);
  if (!bucket) {
    bucket = { tokens: policy.capacity, lastRefill: now };
    rateLimitMap.set(bucketKey, bucket);
  } else {
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(policy.capacity, bucket.tokens + elapsedSeconds * policy.refillPerSecond);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return false;
  }
  return true;
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  );
}

/**
 * Client IP. `x-forwarded-for` is a comma list where the FIRST entry is the
 * originating client (later hops are proxies that append themselves). Only
 * trust these headers when the app is actually behind a proxy you control.
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function getRedirectUrl(path: string, req: NextRequest): URL {
  const url = req.nextUrl.clone();
  url.pathname = path;
  url.search = '';
  if (url.hostname === '0.0.0.0') {
    url.hostname = 'localhost';
  }
  return url;
}

const isProduction = process.env.NODE_ENV === 'production';

// Next.js dev tooling (HMR, React refresh) needs eval; production does not.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src \'self\' data: https://fonts.gstatic.com',
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  if (isProduction) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

export async function proxy(request: NextRequest) {
  let token = request.cookies.get('session_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);
  const isApi = pathname.startsWith('/api');
  const isCredentialRoute =
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/oauth/token' ||
    pathname === '/api/settings/change-password' ||
    pathname === '/api/settings/delete-account';

  // Rate limiting. Credential endpoints get their own, much tighter bucket so a
  // password-guessing loop cannot hide inside the general API allowance.
  if (isApi) {
    if (isCredentialRoute && request.method !== 'GET') {
      if (isRateLimited(`auth:${ip}`, AUTH_POLICY)) return applySecurityHeaders(rateLimitedResponse(60));
    } else if (!pathname.startsWith('/api/auth')) {
      if (isRateLimited(`api:${ip}`, API_POLICY)) return applySecurityHeaders(rateLimitedResponse(1));
    }
  }

  // If user is already logged in and visits /login or /register, redirect to /dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    try {
      await jwtVerify(token, key, { algorithms: ['HS256'] });
      return applySecurityHeaders(NextResponse.redirect(getRedirectUrl('/dashboard', request)));
    } catch {
      // Token invalid — let them see the login/register page
    }
  }

  let response = NextResponse.next();

  // Protect /dashboard and all sub-routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      response = NextResponse.redirect(getRedirectUrl('/login', request));
    } else {
      try {
        await jwtVerify(token, key, { algorithms: ['HS256'] });
      } catch {
        response = NextResponse.redirect(getRedirectUrl('/login', request));
        response.cookies.delete('session_token');
      }
    }
  }

  // Protect sensitive API endpoints (excluding auth routes, v1 profile, and AI
  // endpoints, which authenticate themselves via API key or session).
  if (
    isApi &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/v1/profile') &&
    !pathname.startsWith('/api/ai/') &&
    pathname !== '/api/oauth/token'
  ) {
    if (!token) {
      response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      try {
        await jwtVerify(token, key, { algorithms: ['HS256'] });
      } catch {
        response = NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }
    }
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/register'],
};
