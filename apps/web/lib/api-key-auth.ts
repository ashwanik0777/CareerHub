import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';

export interface ApiKeyValidationResult {
  isValid: boolean;
  errorResponse?: { error: string; status: number };
  userId?: string;
  name?: string;
  email?: string;
}

/**
 * Validates a request against database API keys and verifies target scope bounds.
 */
export async function validateApiKey(
  request: Request,
  requiredScope = 'profile:read'
): Promise<ApiKeyValidationResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      errorResponse: { error: 'Unauthorized: Bearer token required', status: 401 },
    };
  }

  const apiKeyStr = authHeader.substring(7);

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: apiKeyStr },
      include: {
        user: true,
      },
    });

    if (!apiKey) {
      return {
        isValid: false,
        errorResponse: { error: 'Unauthorized: Invalid API key', status: 401 },
      };
    }

    // Verify scope bounds
    if (!apiKey.scopes.includes(requiredScope)) {
      return {
        isValid: false,
        errorResponse: {
          error: `Forbidden: Insufficient scopes. Required: ${requiredScope}`,
          status: 403,
        },
      };
    }

    // Verify expiration limits
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return {
        isValid: false,
        errorResponse: { error: 'Unauthorized: API key expired', status: 401 },
      };
    }

    return {
      isValid: true,
      userId: apiKey.userId,
      name: apiKey.user.name,
      email: apiKey.user.email,
    };
  } catch (error) {
    console.error('[ApiKeyAuth] Error validating API key:', error);
    return {
      isValid: false,
      errorResponse: { error: 'Internal Server Error during validation', status: 500 },
    };
  }
}

/**
 * Access check for the AI endpoints: accepts EITHER a scoped API key OR a
 * logged-in session (the extension sends its session JWT as a Bearer token,
 * which getSession() resolves via its Authorization-header fallback).
 */
export async function validateAiAccess(
  request: Request,
  requiredScope = 'ai:predict'
): Promise<ApiKeyValidationResult> {
  const apiKeyResult = await validateApiKey(request, requiredScope);
  if (apiKeyResult.isValid) {
    return apiKeyResult;
  }

  const session = await getSession();
  if (session) {
    return {
      isValid: true,
      userId: session.userId,
      name: session.name,
      email: session.email,
    };
  }

  return apiKeyResult;
}
