# Security Policy Guidelines

## 1. Authentication Protocols
- **Session Tokens**: JWT tokens are signed with `HS256` using `JWT_SECRET` (minimum 32 characters, no fallback value exists in code: the app refuses to start without it). Tokens are stored in HttpOnly, SameSite=Lax cookies (Secure in production) and additionally recorded in the `Session` table so they can be revoked server-side. Changing a password revokes every other session; expired sessions are purged on login.
- **Password Policies**: Passwords are hashed with `bcryptjs` (cost 10). Minimum 8 characters, maximum 128. Login compares against a dummy hash when the email is unknown so response timing does not reveal whether an account exists. Emails are normalised (trimmed, lower-cased) before storage and lookup.
- **Account deletion** requires the current password in addition to a logged-in session.

## 2. API Protection and Throttling
- **API Keys**: Only the SHA-256 digest of a key is stored (`ApiKey.keyHash`); the plaintext is printed once by `packages/db/scripts/create-api-key.mjs` and cannot be recovered. Clients send `Authorization: Bearer <key>`. Keys carry scopes and an optional expiry.
- **OAuth 2.0**: Client secrets are stored hashed and compared in constant time. Authorization codes are stored hashed, bound to client + user + redirect URI + scopes, expire after 10 minutes and are single-use. Access tokens are issued as scoped, 1-hour `ApiKey` rows, so `/api/v1/profile` accepts them like any other key.
- **Rate Limiting**: The Next.js proxy applies a per-IP token bucket to `/api/*` (100 burst, 2/s sustained) and a much tighter bucket to credential endpoints — login, register, OAuth token, change-password, delete-account — of 10 attempts, then ~10/min. State is per server instance; use a shared store (Redis) when running multiple replicas.
- **Input validation**: Every mutating route parses its body with a Zod schema from `@platform/validation`. URL fields accept only `http(s)` schemes, arrays and JSON payloads are bounded, and dates reject `null`/booleans instead of coercing them to 1970.
- **Security headers**: `Content-Security-Policy` (no `unsafe-eval` in production, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS in production.

## 3. Browser Extension Communication
- **Permission Boundary**: Host permissions and the content script are limited to the backend origin (`http://localhost:3000` by default) and the supported job boards (Greenhouse, Lever, Workday, LinkedIn Jobs, Indeed, Internshala, Naukri). Any other site is only touched when the user clicks the extension action (`activeTab`). Automatic fill on navigation runs only on supported job boards.
- **Backend URL**: Stored once in `chrome.storage.sync` as a validated origin — `https://` only, or `http://localhost` for development. Saving a new origin asks Chrome for host access to that single origin via `optional_host_permissions`; the session token is never sent anywhere else.
- **Message Validation**: The background worker ignores messages whose `sender.id` is not the extension's own, and privileged actions (status, autofill trigger, logout, resync) are accepted only from extension pages, never from content scripts.
- **Sensitive fields** (password, CSRF/token, OTP, captcha, card/payment, PIN) are never filled, on any code path.
- **Cache hygiene**: Profile and resume data cached in `chrome.storage.local` are cleared on sign-out, on a 401 from the backend, when the backend URL changes, and whenever the backend's session cookie changes.
- **UI rendering**: Extension-injected popups build their markup statically and assign page/profile-derived values through `textContent`/`value`, never via HTML interpolation.
