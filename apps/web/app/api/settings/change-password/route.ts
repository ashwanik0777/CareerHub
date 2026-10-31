import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@platform/db';
import { getSession, getRequestMeta, revokeOtherSessions } from '@/lib/auth-server';
import { changePasswordSchema } from '@platform/validation';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Validation failed', details: { currentPassword: ['Current password is incorrect'] } },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const { userAgent, ipAddress } = getRequestMeta(request);

    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newPasswordHash },
    });

    // A password change must invalidate every other device/session.
    await Promise.all([
      revokeOtherSessions(session.userId),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'PASSWORD_CHANGED',
          ipAddress,
          userAgent,
          details: 'User updated password; other sessions revoked.',
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
