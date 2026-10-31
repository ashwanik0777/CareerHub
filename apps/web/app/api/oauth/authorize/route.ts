import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@platform/db';
import { OAUTH_SCOPES, oauthAuthorizeQuerySchema, oauthConsentSchema } from '@platform/validation';
import { generateOpaqueCode, hashSecret } from '@/lib/api-keys';

const CODE_TTL_MS = 10 * 60 * 1000; // RFC 6749 §4.1.2 recommends ≤ 10 minutes

// GET: describe the client so the consent screen can render it.
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = oauthAuthorizeQuerySchema.safeParse({
      client_id: searchParams.get('client_id') ?? undefined,
      redirect_uri: searchParams.get('redirect_uri') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const client = await prisma.oauthClient.findUnique({
      where: { clientId: parsed.data.client_id },
      select: { name: true, redirectUris: true },
    });
    if (!client) {
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
    }

    if (parsed.data.redirect_uri && !client.redirectUris.includes(parsed.data.redirect_uri)) {
      return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      clientName: client.name,
      scopes: OAUTH_SCOPES,
    });
  } catch (error) {
    console.error('[oauth/authorize GET] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: record consent and issue a single-use authorization code bound to
// (client, user, redirect_uri, scopes).
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = oauthConsentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { clientId, redirectUri, scopes, state } = parsed.data;

    const client = await prisma.oauthClient.findUnique({
      where: { clientId },
      select: { clientId: true, redirectUris: true },
    });
    if (!client) {
      return NextResponse.json({ error: 'Invalid client' }, { status: 400 });
    }
    if (!client.redirectUris.includes(redirectUri)) {
      return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
    }

    const code = generateOpaqueCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await prisma.$transaction([
      prisma.oauthConsent.upsert({
        where: { userId_clientId: { userId: session.userId, clientId } },
        update: { scopes },
        create: { userId: session.userId, clientId, scopes },
      }),
      prisma.oauthAuthorizationCode.create({
        data: {
          codeHash: hashSecret(code),
          clientId,
          userId: session.userId,
          redirectUri,
          scopes,
          expiresAt,
        },
      }),
      // Opportunistic cleanup of stale codes for this client.
      prisma.oauthAuthorizationCode.deleteMany({
        where: { clientId, OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }] },
      }),
    ]);

    return NextResponse.json({
      success: true,
      code,
      state,
      expiresIn: CODE_TTL_MS / 1000,
    });
  } catch (error) {
    console.error('[oauth/authorize POST] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
