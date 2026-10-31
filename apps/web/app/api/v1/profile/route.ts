import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { validateApiKey } from '@/lib/api-key-auth';

/**
 * Developer API v1: read the key owner's profile.
 * Auth: `Authorization: Bearer <api key or OAuth access token>` with `profile:read`.
 */
export async function GET(request: Request) {
  try {
    const auth = await validateApiKey(request, 'profile:read');
    if (!auth.isValid || !auth.userId) {
      const err = auth.errorResponse ?? { error: 'Unauthorized', status: 401 };
      return NextResponse.json({ error: err.error }, { status: err.status });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: auth.userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        projects: { orderBy: { startDate: 'desc' } },
        skills: { orderBy: { category: 'asc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        awards: { orderBy: { date: 'desc' } },
        languages: { orderBy: { name: 'asc' } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      name: auth.name,
      email: auth.email,
      profile: {
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        preferredLocation: profile.preferredLocation,
        availability: profile.availability,
        websiteUrl: profile.websiteUrl,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        experiences: profile.experiences,
        educations: profile.educations,
        projects: profile.projects,
        skills: profile.skills,
        certifications: profile.certifications,
        awards: profile.awards,
        languages: profile.languages,
      },
    });
  } catch (error) {
    console.error('[v1/profile] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
