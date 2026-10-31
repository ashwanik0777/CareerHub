import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@platform/db';
import { oauthRegisterSchema } from '@platform/validation';
import { generateClientSecret, generateOpaqueCode, hashSecret } from '@/lib/api-keys';

const MAX_CLIENTS_PER_USER = 10;

/**
 * Registers an OAuth client owned by the current user. The client secret is
 * returned exactly once; only its hash is stored.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const result = oauthRegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.oauthClient.count({ where: { userId: session.userId } });
    if (existing >= MAX_CLIENTS_PER_USER) {
      return NextResponse.json({ error: `At most ${MAX_CLIENTS_PER_USER} OAuth clients per account` }, { status: 400 });
    }

    const clientId = generateOpaqueCode();
    const clientSecret = generateClientSecret();

    const client = await prisma.oauthClient.create({
      data: {
        userId: session.userId,
        clientId,
        clientSecretHash: hashSecret(clientSecret),
        name: result.data.name,
        redirectUris: result.data.redirectUris,
      },
    });

    return NextResponse.json({
      success: true,
      clientId: client.clientId,
      clientSecret, // shown once
      name: client.name,
      redirectUris: client.redirectUris,
    });
  } catch (error) {
    console.error('[oauth/register] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
