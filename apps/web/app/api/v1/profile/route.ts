import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Bearer token required' }, { status: 401 });
    }

    const apiKeyStr = authHeader.substring(7);

    // Validate API Key
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: apiKeyStr },
      include: {
        user: {
          include: {
            profile: {
              include: {
                experiences: true,
                educations: true,
                projects: true,
                skills: true,
                certifications: true,
                awards: true,
                languages: true,
              },
            },
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API key' }, { status: 401 });
    }

    // Check scopes
    if (!apiKey.scopes.includes('profile:read')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient scopes' }, { status: 403 });
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Unauthorized: API key expired' }, { status: 401 });
    }

    const profile = apiKey.user.profile;
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Return profile payload formatted nicely
    return NextResponse.json({
      success: true,
      name: apiKey.user.name,
      email: apiKey.user.email,
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
