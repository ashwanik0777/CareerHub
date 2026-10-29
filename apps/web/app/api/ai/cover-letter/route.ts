import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@platform/db';
import { aiService } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobDescription, tone } = body;

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: {
        experiences: true,
        educations: true,
        projects: true,
        skills: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Please create your profile first' }, { status: 400 });
    }

    const fullProfileData = {
      ...profile,
      user: { name: session.name, email: session.email },
    };

    const coverLetter = await aiService.generateCoverLetter(fullProfileData, jobDescription, tone);
    return NextResponse.json({ success: true, coverLetter });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
