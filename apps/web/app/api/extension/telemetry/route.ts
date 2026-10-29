import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { hasRequiredRole } from '@/lib/auth';
import { Role } from '@platform/types';

/**
 * Strips PII from telemetry data before persisting.
 * Removes userId linkage from mappingDetails and sanitises pageUrl.
 */
function stripPii(data: Record<string, any>): Record<string, any> {
  const sanitised = { ...data };

  // Remove raw pageUrl query params (may contain tokens/emails)
  if (typeof sanitised.pageUrl === 'string') {
    try {
      const url = new URL(sanitised.pageUrl);
      url.search = '';
      url.hash = '';
      sanitised.pageUrl = url.toString();
    } catch {
      // If not a valid URL, keep as-is
    }
  }

  // Scrub mappingDetails of any embedded PII fields
  if (sanitised.mappingDetails && typeof sanitised.mappingDetails === 'object') {
    const scrubbed = JSON.parse(JSON.stringify(sanitised.mappingDetails));
    const piiKeys = ['email', 'phone', 'name', 'address', 'ssn', 'password', 'token'];
    const scrubObject = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(scrubObject);
      } else if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (piiKeys.some((pk) => key.toLowerCase().includes(pk))) {
            obj[key] = '[REDACTED]';
          } else {
            scrubObject(obj[key]);
          }
        }
      }
    };
    scrubObject(scrubbed);
    sanitised.mappingDetails = scrubbed;
  }

  return sanitised;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (!body.platform || !body.pageUrl) {
      return NextResponse.json(
        { error: 'Validation failed', details: { platform: !body.platform ? ['Required'] : [], pageUrl: !body.pageUrl ? ['Required'] : [] } },
        { status: 400 },
      );
    }

    const sanitisedData = stripPii(body);

    const telemetryEntry = await prisma.autofillSession.create({
      data: {
        userId: session.userId,
        platform: sanitisedData.platform,
        pageUrl: sanitisedData.pageUrl,
        totalFields: sanitisedData.totalFields ?? 0,
        detectedFields: sanitisedData.detectedFields ?? 0,
        filledFields: sanitisedData.filledFields ?? 0,
        skippedFields: sanitisedData.skippedFields ?? 0,
        userCorrections: sanitisedData.userCorrections ?? 0,
        highConfidence: sanitisedData.highConfidence ?? 0,
        mediumConfidence: sanitisedData.mediumConfidence ?? 0,
        lowConfidence: sanitisedData.lowConfidence ?? 0,
        avgConfidence: sanitisedData.avgConfidence ?? 0,
        executionTimeMs: sanitisedData.executionTimeMs ?? 0,
        mappingDetails: sanitisedData.mappingDetails ?? null,
      },
    });

    return NextResponse.json({ telemetry: telemetryEntry });
  } catch (error) {
    console.error('Store telemetry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Admin-only access
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !hasRequiredRole(user.role as Role, Role.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where: Record<string, any> = {};
    if (platform) where.platform = platform;

    const [entries, total] = await Promise.all([
      prisma.autofillSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.autofillSession.count({ where }),
    ]);

    return NextResponse.json({ entries, total, limit, offset });
  } catch (error) {
    console.error('Fetch telemetry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
