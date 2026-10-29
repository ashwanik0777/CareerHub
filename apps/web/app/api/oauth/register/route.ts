import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@platform/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, redirectUris } = body;

    if (!name || !Array.isArray(redirectUris) || redirectUris.length === 0) {
      return NextResponse.json({ error: 'Client name and redirect URIs are required' }, { status: 400 });
    }

    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const client = await prisma.oauthClient.create({
      data: {
        userId: session.userId,
        clientId,
        clientSecret,
        name,
        redirectUris,
      },
    });

    return NextResponse.json({
      success: true,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      name: client.name,
      redirectUris: client.redirectUris,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
