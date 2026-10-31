import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@platform/db';
import { loginSchema } from '@platform/validation';
import { createSession, getRequestMeta, purgeExpiredSessions } from '@/lib/auth-server';

// Hash of a throwaway password: compared against when the email is unknown so
// that "no such user" and "wrong password" take the same time (no user enumeration by timing).
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Zx2dpCRRbp9CMbqSfbqX2dgDm.Fo6';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });

    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordOk) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { userAgent, ipAddress } = getRequestMeta(request);

    const [token] = await Promise.all([
      createSession(user.id, user.email, user.name, userAgent, ipAddress),
      purgeExpiredSessions(user.id),
      prisma.auditLog.create({
        data: { userId: user.id, action: 'USER_LOGGED_IN', ipAddress, userAgent },
      }),
    ]);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      token, // Also returned for non-browser clients (the extension stores it)
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
