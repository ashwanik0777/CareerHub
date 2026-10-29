import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { educationSchema } from '@platform/validation';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const educations = await prisma.education.findMany({
      where: { profileId: profile.id },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ educations });
  } catch (error) {
    console.error('Fetch education error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const body = await request.json();
    const result = educationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        ...result.data,
      },
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error('Create education error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing education ID' }, { status: 400 });

    const body = await request.json();
    const result = educationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify ownership
    const education = await prisma.education.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!education || education.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    const updated = await prisma.education.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ education: updated });
  } catch (error) {
    console.error('Update education error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing education ID' }, { status: 400 });

    // Verify ownership
    const education = await prisma.education.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!education || education.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    await prisma.education.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete education error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
