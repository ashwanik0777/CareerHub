import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getCurrentUser } from '@/lib/auth-server';
import { hasRequiredRole } from '@/lib/auth';
import { Role } from '@platform/types';
import { datasetEntrySchema, paginationQuerySchema } from '@platform/validation';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasRequiredRole(user.role as Role, Role.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const { limit, offset } = paginationQuerySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });
    const platform = searchParams.get('platform')?.slice(0, 100);
    const semanticCategory = searchParams.get('semanticCategory')?.slice(0, 100);
    const isVerified = searchParams.get('isVerified');

    const where: Record<string, unknown> = {};
    if (platform) where.platform = platform;
    if (semanticCategory) where.semanticCategory = semanticCategory;
    if (isVerified === 'true' || isVerified === 'false') where.isVerified = isVerified === 'true';

    const [entries, total] = await Promise.all([
      prisma.formDatasetEntry.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
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
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const result = datasetEntrySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const entry = await prisma.formDatasetEntry.create({ data: result.data });
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Create dataset entry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
