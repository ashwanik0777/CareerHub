import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { ResumeIntelligence } from '@/lib/resume-intelligence';
import { profileVariantSchema } from '@platform/validation';

const resumeIntelligence = new ResumeIntelligence();

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const variants = await prisma.profileVariant.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Fetch profile variants error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const parsed = profileVariantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { scenario, targetRole } = parsed.data;

    // Fetch the user's full profile to feed the intelligence engine
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        projects: { orderBy: { startDate: 'desc' } },
        skills: { orderBy: { category: 'asc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        awards: { orderBy: { date: 'desc' } },
        languages: { orderBy: { name: 'asc' } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Create a profile first.' }, { status: 404 });
    }

    // Generate variant config using intelligence service
    const variantConfig = resumeIntelligence.createVariant(profile, scenario, targetRole);

    const variant = await prisma.profileVariant.create({
      data: {
        userId: session.userId,
        name: variantConfig.name,
        targetRole: variantConfig.targetRole,
        scenario: variantConfig.scenario,
        structure: variantConfig.structure as any,
      },
    });

    return NextResponse.json({ variant });
  } catch (error) {
    console.error('Create profile variant error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
