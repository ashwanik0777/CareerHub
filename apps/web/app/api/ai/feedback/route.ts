import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { validateAiAccess } from '@/lib/api-key-auth';
import { aiFeedbackSchema } from '@platform/validation';

export async function POST(request: Request) {
  // Authenticate: scoped API key OR logged-in session (extension flow)
  const auth = await validateAiAccess(request, 'ai:predict');
  if (!auth.isValid && auth.errorResponse) {
    return NextResponse.json(
      { error: auth.errorResponse.error },
      { status: auth.errorResponse.status }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const result = aiFeedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: auth.userId ?? null,
        action: result.data.wasCorrected ? 'AI_PREDICTION_CORRECTED' : 'AI_PREDICTION_FEEDBACK',
        details: JSON.stringify({
          url: result.data.url,
          predictedClass: result.data.predictedClass,
          elementName: result.data.elementName,
          timestamp: result.data.timestamp ?? Date.now(),
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI feedback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
