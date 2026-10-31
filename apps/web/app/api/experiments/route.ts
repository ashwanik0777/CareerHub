import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { getCurrentUser } from '@/lib/auth-server';
import { hasRequiredRole } from '@/lib/auth';
import { Role } from '@platform/types';
import { experimentRunSchema, paginationQuerySchema } from '@platform/validation';

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
    const strategy = searchParams.get('strategy')?.slice(0, 100);

    const where: Record<string, unknown> = {};
    if (strategy) where.strategy = strategy;

    const [experiments, total] = await Promise.all([
      prisma.experimentRun.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
      prisma.experimentRun.count({ where }),
    ]);

    return NextResponse.json({ experiments, total, limit, offset });
  } catch (error) {
    console.error('Fetch experiments error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const result = experimentRunSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { configuration, results, ...rest } = result.data;
    const experiment = await prisma.experimentRun.create({
      data: {
        ...rest,
        configuration: configuration == null ? undefined : (configuration as object),
        results: results == null ? undefined : (results as object),
      },
    });
    return NextResponse.json({ experiment });
  } catch (error) {
    console.error('Create experiment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
