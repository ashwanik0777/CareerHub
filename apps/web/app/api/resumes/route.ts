import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { resumeSchema } from '@platform/validation';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resumes = await prisma.resume.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Fetch resumes error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = resumeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const resumeData = result.data;

    const resume = await prisma.$transaction(async (tx) => {
      if (resumeData.isDefault) {
        // Reset all other resumes for this user to isDefault: false
        await tx.resume.updateMany({
          where: { userId: session.userId },
          data: { isDefault: false },
        });
      }

      return await tx.resume.create({
        data: {
          userId: session.userId,
          title: resumeData.title,
          targetRole: resumeData.targetRole,
          summary: resumeData.summary,
          isDefault: resumeData.isDefault,
          structure: resumeData.structure,
        },
      });
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Create resume error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing resume ID' }, { status: 400 });

    const body = await request.json();
    const result = resumeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    const resumeData = result.data;

    const updated = await prisma.$transaction(async (tx) => {
      if (resumeData.isDefault) {
        // Reset all other resumes to false
        await tx.resume.updateMany({
          where: {
            userId: session.userId,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      return await tx.resume.update({
        where: { id },
        data: {
          title: resumeData.title,
          targetRole: resumeData.targetRole,
          summary: resumeData.summary,
          isDefault: resumeData.isDefault,
          structure: resumeData.structure,
        },
      });
    });

    return NextResponse.json({ resume: updated });
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing resume ID' }, { status: 400 });

    // Verify ownership
    const existing = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Not Found or Unauthorized' }, { status: 404 });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
