import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { languageSchema } from '@platform/validation';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const languages = await prisma.language.findMany({
      where: { profileId: profile.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ languages });
  } catch (error) {
    console.error('Fetch languages error:', error);
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
    const result = languageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if language already exists
    const existing = await prisma.language.findUnique({
      where: {
        profileId_name: {
          profileId: profile.id,
          name: result.data.name,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Language already registered' }, { status: 400 });
    }

    const language = await prisma.language.create({
      data: {
        profileId: profile.id,
        ...result.data,
      },
    });

    return NextResponse.json({ language });
  } catch (error) {
    console.error('Create language error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing language ID' }, { status: 400 });

    const body = await request.json();
    const result = languageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify ownership
    const language = await prisma.language.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!language || language.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    const updated = await prisma.language.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ language: updated });
  } catch (error) {
    console.error('Update language error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing language ID' }, { status: 400 });

    // Verify ownership
    const language = await prisma.language.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!language || language.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    await prisma.language.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete language error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
