import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession, deleteSession } from '@/lib/auth-server';

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete user from database (Cascade deletes Profile, Settings, Experience, etc.)
    await prisma.user.delete({
      where: { id: session.userId },
    });

    // Clear session cookies
    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
