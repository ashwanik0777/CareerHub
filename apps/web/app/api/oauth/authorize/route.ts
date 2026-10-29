import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@platform/db';
import crypto from 'crypto';

// GET checks if OAuth Client is registered and returns name/scopes
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');

    if (!clientId) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    const client = await prisma.oauthClient.findUnique({
      where: { clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
    }

    if (redirectUri && !client.redirectUris.includes(redirectUri)) {
      return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      clientName: client.name,
      scopes: ['profile:read', 'profile:write'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST processes consent and returns a mock authorization code
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, scopes } = body;

    if (!clientId || !Array.isArray(scopes)) {
      return NextResponse.json({ error: 'client_id and scopes are required' }, { status: 400 });
    }

    const client = await prisma.oauthClient.findUnique({
      where: { clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Invalid client' }, { status: 400 });
    }

    // Upsert User Consent
    await prisma.oauthConsent.upsert({
      where: {
        userId_clientId: {
          userId: session.userId,
          clientId,
        },
      },
      update: { scopes },
      create: {
        userId: session.userId,
        clientId,
        scopes,
      },
    });

    // Generate temporary authorization code
    const authorizationCode = crypto.randomBytes(16).toString('hex');
    
    return NextResponse.json({
      success: true,
      code: authorizationCode,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
