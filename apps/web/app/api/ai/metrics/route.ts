import { NextResponse } from 'next/server';
import { validateAiAccess } from '@/lib/api-key-auth';
import { modelLoader, predictionCache, MODEL_CLASSES } from '@platform/ai-model';

export async function GET(request: Request) {
  // Authenticate: scoped API key OR logged-in session (extension flow)
  const auth = await validateAiAccess(request, 'ai:predict');
  if (!auth.isValid && auth.errorResponse) {
    return NextResponse.json(
      { error: auth.errorResponse.error },
      { status: auth.errorResponse.status }
    );
  }

  try {
    const runtime = modelLoader.getStats();
    const cache = predictionCache.getStats();
    const health = modelLoader.getHealth();

    return NextResponse.json({
      success: true,
      metrics: {
        runtime: {
          totalPredictions: runtime.totalPredictions,
          avgLatencyMs: runtime.avgLatencyMs,
          modelLoadTimeMs: runtime.loadTimeMs,
          warmupTimeMs: runtime.warmupTimeMs,
          modelVersion: health.activeVersion,
          cacheHitRate: cache.hitRate,
          cacheHits: cache.hits,
          cacheMisses: cache.misses,
          cacheSize: cache.size,
        },
        training: {
          headlineF1: 0.423,
          headlineAccuracy: 0.934,
          headlinePrecision: 0.403,
          headlineRecall: 0.457,
          classImbalanceNote: '89.9% miscellaneous in training corpus',
        },
        numClasses: MODEL_CLASSES.length,
        classes: MODEL_CLASSES,
      },
    });
  } catch (error) {
    console.error('AI metrics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
