import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@platform/db';
import { getSession, deleteSession } from '@/lib/auth-server';
import { deleteAccountSchema } from '@platform/validation';

/**
 * Permanently deletes the account. Requires the current password so a
 * hijacked session (open laptop, stolen cookie) cannot wipe the account.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const result = deleteAccountSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isMatch = await bcrypt.compare(result.data.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Validation failed', details: { password: ['Password is incorrect'] } },
        { status: 400 }
      );
    }

    // Cascade deletes Profile, Settings, Sessions, Resumes, API keys, etc.
    await prisma.user.delete({ where: { id: session.userId } });

    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
