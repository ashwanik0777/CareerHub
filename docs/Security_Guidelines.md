# Security Policy Guidelines

## 1. Authentication Protocols
- **Session Tokens**: JWT tokens are signed using high-entropy keys (`HS256`) and stored in HTTP-only, secure cookies with lax same-site policies. This prevents client-side access and mitigates Cross-Site Scripting (XSS) session hijacking.
- **Password Policies**: User credentials are encrypted with `bcryptjs` using a salt round cost of 10 prior to database storage.

## 2. API Protection and Throttling
- **API Keys**: Access keys are hashed and stored in database schemas. Clients must provide headers formatted as `Authorization: Bearer <key>`.
- **Rate Limiting**: Public endpoints are rate-limited via a Next.js middleware token-bucket mechanism to prevent Denial of Service (DoS) and brute-force attacks.

## 3. Browser Extension Communication
- **Permission Boundary**: The extension limits host permissions explicitly to domains requested by users.
- **Message Validation**: Background workers validate incoming script ports to prevent rogue web applications from executing privileged extension actions.
