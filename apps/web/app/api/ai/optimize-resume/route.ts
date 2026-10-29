import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeText, targetRole } = body;

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const recommendations = await aiService.optimizeResume(resumeText, targetRole);
    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
