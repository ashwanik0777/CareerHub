import { NextResponse } from 'next/server';
import { modelLoader } from '@platform/ai-model';

/**
 * Public liveness/readiness probe for the AI inference layer.
 * Intentionally unauthenticated (uptime monitors, load balancers) and
 * intentionally minimal: no filesystem paths or internal error details.
 */
export async function GET() {
  try {
    const health = modelLoader.getHealth();
    return NextResponse.json({
      success: true,
      health: {
        status: health.status,
        modelLoaded: health.status === 'healthy',
        warmedUp: health.warmedUp,
        memoryUsageRssMb: health.memoryUsageRssMb,
        avgLatencyMs: health.avgLatencyMs,
        version: health.activeVersion,
      },
    });
  } catch (error) {
    console.error('AI health error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
