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
    const strategy = searchParams.get('strategy');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where: Record<string, any> = {};
    if (strategy) where.strategy = strategy;

    const [experiments, total] = await Promise.all([
      prisma.experimentRun.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
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
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ADMIN/SUPERADMIN only
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !hasRequiredRole(user.role as Role, Role.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name || !body.strategy) {
      return NextResponse.json(
        { error: 'Validation failed', details: { name: !body.name ? ['Required'] : [], strategy: !body.strategy ? ['Required'] : [] } },
        { status: 400 },
      );
    }

    const experiment = await prisma.experimentRun.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        strategy: body.strategy,
        datasetSize: body.datasetSize ?? 0,
        accuracy: body.accuracy ?? 0,
        precision: body.precision ?? 0,
        recall: body.recall ?? 0,
        f1Score: body.f1Score ?? 0,
        avgInferenceMs: body.avgInferenceMs ?? 0,
        configuration: body.configuration ?? null,
        results: body.results ?? null,
      },
    });

    return NextResponse.json({ experiment });
  } catch (error) {
    console.error('Create experiment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
