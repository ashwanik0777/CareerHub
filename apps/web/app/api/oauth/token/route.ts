import { NextResponse } from 'next/server';
import { prisma } from '@platform/db';
import { oauthTokenSchema } from '@platform/validation';
import { generateOauthAccessToken, hashSecret, secretMatches } from '@/lib/api-keys';

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function oauthError(error: string, description: string, status = 400) {
  // RFC 6749 §5.2 error shape
  return NextResponse.json({ error, error_description: description }, { status });
}

/**
 * Exchanges a single-use authorization code for an access token.
 * The access token is stored (hashed) as a scoped ApiKey, so `/api/v1/profile`
 * accepts it like any other key and it can be revoked/expired the same way.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    const raw = contentType.includes('application/x-www-form-urlencoded')
      ? Object.fromEntries(new URLSearchParams(await request.text()))
      : await request.json().catch(() => null);

    const parsed = oauthTokenSchema.safeParse(raw);
    if (!parsed.success) {
      return oauthError('invalid_request', 'client_id, client_secret, code and redirect_uri are required');
    }
    const { client_id, client_secret, code, redirect_uri } = parsed.data;

    const client = await prisma.oauthClient.findUnique({
      where: { clientId: client_id },
      select: { clientId: true, clientSecretHash: true },
    });
    if (!client || !secretMatches(client_secret, client.clientSecretHash)) {
      return oauthError('invalid_client', 'Invalid client credentials', 401);
    }

    // Atomically consume the code: the update only succeeds if it is unused,
    // unexpired and belongs to this client + redirect_uri.
    const consumed = await prisma.oauthAuthorizationCode.updateMany({
      where: {
        codeHash: hashSecret(code),
        clientId: client.clientId,
        redirectUri: redirect_uri,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });
    if (consumed.count !== 1) {
      return oauthError('invalid_grant', 'Authorization code is invalid, expired, or already used');
    }

    const authCode = await prisma.oauthAuthorizationCode.findUnique({
      where: { codeHash: hashSecret(code) },
      select: { userId: true, scopes: true },
    });
    if (!authCode) {
      return oauthError('invalid_grant', 'Authorization code is invalid');
    }

    const accessToken = generateOauthAccessToken();
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

    await prisma.apiKey.create({
      data: {
        userId: authCode.userId,
        keyHash: hashSecret(accessToken),
        keyPrefix: accessToken.slice(0, 8),
        name: `OAuth token (${client.clientId.slice(0, 8)})`,
        scopes: authCode.scopes,
        oauthClientId: client.clientId,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_TTL_MS / 1000,
        scope: authCode.scopes.join(' '),
      },
      { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  } catch (error) {
    console.error('[oauth/token] error:', error);
    return oauthError('server_error', 'Internal Server Error', 500);
  }
}
