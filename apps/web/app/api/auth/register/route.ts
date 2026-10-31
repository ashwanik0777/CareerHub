import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, Prisma } from '@platform/db';
import { registerSchema } from '@platform/validation';
import { createSession, getRequestMeta } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;
    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          profile: { create: {} },
          settings: { create: {} },
        },
      });
    } catch (e) {
      // Unique-constraint race (two registrations for the same email at once)
      // or an existing account: both are a 400, never a 500.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      throw e;
    }

    const { userAgent, ipAddress } = getRequestMeta(request);

    await Promise.all([
      createSession(user.id, user.email, user.name, userAgent, ipAddress),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          ipAddress,
          userAgent,
          details: JSON.stringify({ email: user.email }),
        },
      }),
    ]);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
