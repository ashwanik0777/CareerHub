import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { projectSchema } from '@platform/validation';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const projects = await prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
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
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        ...result.data,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });

    const body = await request.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
