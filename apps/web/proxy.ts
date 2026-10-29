import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'platform-enterprise-fallback-secret-key-32chars';
const key = new TextEncoder().encode(JWT_SECRET);

// In-memory token bucket rate limiter for API endpoints
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();
const RATE_LIMIT_CAPACITY = 100; // Max 100 requests in burst
const RATE_LIMIT_REFILL_RATE = 2; // Refill 2 tokens per second

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let bucket = rateLimitMap.get(ip);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_CAPACITY, lastRefill: now };
    rateLimitMap.set(ip, bucket);
  } else {
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * RATE_LIMIT_REFILL_RATE;
    bucket.tokens = Math.min(RATE_LIMIT_CAPACITY, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return false;
  }
  return true;
}

function getRedirectUrl(path: string, req: NextRequest): URL {
  const url = req.nextUrl.clone();
  url.pathname = path;
  if (url.hostname === '0.0.0.0') {
    url.hostname = 'localhost';
  }
  return url;
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
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Apply rate limiting on all API endpoints (excluding auth routes)
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // If user is already logged in and visits /login or /register, redirect to /dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    try {
      await jwtVerify(token, key);
      return NextResponse.redirect(getRedirectUrl('/dashboard', request));
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
        await jwtVerify(token, key);
      } catch (err) {
        response = NextResponse.redirect(getRedirectUrl('/login', request));
        response.cookies.delete('session_token');
      }
    }
  }

  // Protect sensitive API endpoints (excluding auth routes, v1 profile, and AI endpoints)
  if (
    pathname.startsWith('/api') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/v1/profile') &&
    !pathname.startsWith('/api/ai/')
  ) {
    if (!token) {
      response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      try {
        await jwtVerify(token, key);
      } catch (err) {
        response = NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }
    }
  }

  // Inject HTTP Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:;"
  );

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/register'],
};
