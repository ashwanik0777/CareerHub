import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { hasRequiredRole } from '@/lib/auth';
import { Role } from '@platform/types';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ADMIN/SUPERADMIN only
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !hasRequiredRole(user.role as Role, Role.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const semanticCategory = searchParams.get('semanticCategory');
    const isVerified = searchParams.get('isVerified');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where: Record<string, any> = {};
    if (platform) where.platform = platform;
    if (semanticCategory) where.semanticCategory = semanticCategory;
    if (isVerified !== null && isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    const [entries, total] = await Promise.all([
      prisma.formDatasetEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.formDatasetEntry.count({ where }),
    ]);

    return NextResponse.json({ entries, total, limit, offset });
  } catch (error) {
    console.error('Fetch dataset entries error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ADMIN/SUPERADMIN only
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !hasRequiredRole(user.role as Role, Role.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.platform || !body.pageUrl || !body.fieldName || !body.fieldType) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: {
            platform: !body.platform ? ['Required'] : [],
            pageUrl: !body.pageUrl ? ['Required'] : [],
            fieldName: !body.fieldName ? ['Required'] : [],
            fieldType: !body.fieldType ? ['Required'] : [],
          },
        },
        { status: 400 },
      );
    }

    const entry = await prisma.formDatasetEntry.create({
      data: {
        platform: body.platform,
        pageUrl: body.pageUrl,
        pageType: body.pageType ?? 'application',
        fieldName: body.fieldName,
        fieldId: body.fieldId ?? null,
        fieldLabel: body.fieldLabel ?? null,
        fieldPlaceholder: body.fieldPlaceholder ?? null,
        fieldType: body.fieldType,
        inputType: body.inputType ?? null,
        ariaLabel: body.ariaLabel ?? null,
        nearbyHeading: body.nearbyHeading ?? null,
        parentSection: body.parentSection ?? null,
        domHierarchy: body.domHierarchy ?? null,
        validationRules: body.validationRules ?? null,
        semanticCategory: body.semanticCategory ?? null,
        ontologyAttributeId: body.ontologyAttributeId ?? null,
        isVerified: body.isVerified ?? false,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Create dataset entry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
