import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { telemetrySchema } from '@platform/validation';

const PII_KEY_FRAGMENTS = ['email', 'phone', 'name', 'address', 'ssn', 'password', 'token', 'passport', 'salary', 'dob', 'birth'];

/** Strips query/hash from a page URL (may carry tokens or emails). */
function sanitisePageUrl(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return pageUrl;
  }
}

/** Recursively redacts any key that looks like it holds personal data. */
function scrubPii(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubPii);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      out[k] = PII_KEY_FRAGMENTS.some((pk) => lower.includes(pk)) ? '[REDACTED]' : scrubPii(v);
    }
    return out;
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const result = telemetrySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const telemetryEntry = await prisma.autofillSession.create({
      data: {
        userId: session.userId,
        platform: data.platform,
        pageUrl: sanitisePageUrl(data.pageUrl),
        totalFields: data.totalFields,
        detectedFields: data.detectedFields,
        filledFields: data.filledFields,
        skippedFields: data.skippedFields,
        userCorrections: data.userCorrections,
        highConfidence: data.highConfidence,
        mediumConfidence: data.mediumConfidence,
        lowConfidence: data.lowConfidence,
        avgConfidence: data.avgConfidence,
        executionTimeMs: data.executionTimeMs,
        mappingDetails: data.mappingDetails == null ? undefined : (scrubPii(data.mappingDetails) as object),
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ telemetry: telemetryEntry });
  } catch (error) {
    console.error('Store telemetry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
