import { z } from 'zod';
import { httpUrl } from './common';

export const OAUTH_SCOPES = ['profile:read', 'profile:write'] as const;
export const oauthScope = z.enum(OAUTH_SCOPES);

/** Redirect URIs must be absolute http(s) and carry no fragment (RFC 6749 §3.1.2). */
const redirectUri = httpUrl('redirect_uri must be an absolute http(s) URL').refine(
  (u) => !u.includes('#'),
  'redirect_uri must not contain a fragment'
);

export const oauthRegisterSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required').max(100),
  redirectUris: z.array(redirectUri).min(1, 'At least one redirect URI is required').max(10),
});

export const oauthAuthorizeQuerySchema = z.object({
  client_id: z.string().min(1, 'client_id is required').max(64),
  redirect_uri: redirectUri.optional(),
});

export const oauthConsentSchema = z.object({
  clientId: z.string().min(1, 'client_id is required').max(64),
  redirectUri: redirectUri,
  scopes: z.array(oauthScope).min(1, 'At least one scope is required').max(OAUTH_SCOPES.length),
  // Opaque value echoed back to the client to bind the response to its request.
  state: z.string().max(512).optional(),
});

export const oauthTokenSchema = z.object({
  grant_type: z.literal('authorization_code').default('authorization_code'),
  client_id: z.string().min(1).max(64),
  client_secret: z.string().min(1).max(128),
  code: z.string().min(1).max(128),
  redirect_uri: redirectUri,
});

export type OauthRegisterInput = z.infer<typeof oauthRegisterSchema>;
export type OauthConsentInput = z.infer<typeof oauthConsentSchema>;
export type OauthTokenInput = z.infer<typeof oauthTokenSchema>;
