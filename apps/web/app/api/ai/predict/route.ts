import { NextResponse } from 'next/server';
import { validateAiAccess } from '@/lib/api-key-auth';
import { fieldPredictionService } from '@/lib/field-prediction-service';
import { predictRequestSchema, batchPredictRequestSchema } from '@platform/validation';

export async function POST(request: Request) {
  // 1. Authenticate: scoped API key OR logged-in session (extension flow)
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

    // 2. Route payload according to batch vs single format
    const isBatch =
      typeof body === 'object' &&
      body !== null &&
      Array.isArray((body as Record<string, unknown>).fields);

    if (isBatch) {
      const result = batchPredictRequestSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const predictions = await fieldPredictionService.predictFieldBatch(result.data.fields);
      return NextResponse.json({ success: true, predictions });
    } else {
      const result = predictRequestSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const prediction = await fieldPredictionService.predictField(result.data.field);
      return NextResponse.json({ success: true, prediction });
    }
  } catch (error: any) {
    console.error('[PredictRoute] Internal prediction failure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
