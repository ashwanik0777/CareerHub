import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, code } = body;

    if (!client_id || !client_secret || !code) {
      return NextResponse.json({ error: 'client_id, client_secret, and code are required' }, { status: 400 });
    }

    const client = await prisma.oauthClient.findUnique({
      where: { clientId: client_id },
    });

    if (!client || client.clientSecret !== client_secret) {
      return NextResponse.json({ error: 'Invalid client credentials' }, { status: 400 });
    }

    // Generate mock access token and refresh token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'profile:read',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
