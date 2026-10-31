# Audit Fix Checklist

Generated from the full security / correctness / performance audit (2026-11-01).
Status legend: `[ ]` pending · `[x]` done · `[-]` deferred (needs a product decision, see note).

## A. Web app — security

- [x] A1. Brute-force protection on `/api/auth/login` and `/api/auth/register` (strict per-IP bucket in proxy)
- [x] A2. Remove hardcoded fallback JWT secret in `apps/web/proxy.ts`
- [x] A3. Hash API keys (SHA-256) — schema `keyHash`, lookup by hash, update create script + routes
- [x] A4. URL fields accept only `http(s)` (blocks `javascript:` / `data:` stored XSS)
- [x] A5. Email normalization (trim + lowercase) in login/register schemas
- [x] A6. Password policy: min 8 everywhere, max 128; name max 100
- [x] A7. OAuth: real authorization codes (stored, single-use, expiring), hashed client secrets, constant-time compare, access tokens issued as scoped API keys
- [x] A8. CSP: drop `unsafe-eval` in production
- [x] A9. Change-password revokes all other sessions
- [x] A10. Delete-account requires current password
- [x] A11. Purge expired sessions (opportunistic on login)
- [x] A12. Zod validation for `/api/extension/telemetry`, `/api/dataset`, `/api/experiments`, `/api/profile-variants`
- [x] A13. Rate limiter: bounded map with eviction, first hop of `x-forwarded-for`
- [x] A14. Bounded arrays/strings: `technologies`, resume structure ID arrays, AI descriptor `.max()`
- [x] A15. `z.coerce.date()` no longer turns `null` into 1970 (all date fields)
- [x] A16. Create `.env.example` (README references it)

## B. Web app — correctness & performance

- [x] B1. Resume download: split descriptions on real newlines
- [x] B2. Dashboard page: run the 4 queries in parallel
- [x] B3. Dedupe per-request session/user lookups with React `cache()`
- [x] B4. Remove unused workspace deps (`api-client`, `profile-engine`) from web app
- [x] B5. Remove duplicate `@@index` on already-unique `Session.token`, `ApiKey.key`
- [x] B6. Register: handle unique-constraint race (P2002) as 400, not 500

## C. Chrome extension

- [x] C1. Narrow `host_permissions` / content-script `matches` (backend origin + supported job boards; `activeTab` covers everything else on click)
- [x] C2. Validate backend URL (https or localhost only); unify `backend_url` / `apiEndpoint`
- [x] C3. Validate `sender` in background `onMessage`
- [x] C4. Clear profile cache on logout for the real backend domain
- [x] C5. Replace `innerHTML` interpolation with DOM APIs (approvalEngine, ai/approval)
- [x] C6. `submitFeedback` unhandled rejection; popup `new URL('')` crash
- [x] C7. Performance: stop MutationObserver after a bounded window; cache shadow-root walk per scan
- [x] C8. Stop emitting compiled `.js/.d.ts/.map` into `src/` (`noEmit`), untrack them, gitignore
- [-] C9. Dead subsystems (~1,800 lines: learning/, dataset/, content/ai/, autofill-pipeline, semantic-analyzer) — listed in research docs, deletion is your call

## D. Shared packages

- [x] D1. Benchmark: fix double-counted false negatives; non-zero exit on regression
- [x] D2. Hybrid mapper: real weighted fusion instead of `max`
- [x] D3. ai-model: clear prediction cache on hot-reload; don't dispose a session that in-flight requests still hold
- [x] D4. api-client: retry only idempotent requests / network errors
- [x] D5. Keyword matcher: precompute alias token sets once
- [x] D6. profile-engine `DateFormatter`: UTC-safe dates; phone regex without `/m`

## E. Repo / CI / docs

- [x] E1. CI: pnpm 10.14.0 (lockfile v9); add type-check step
- [x] E2. `lint` scripts: `next lint` no longer exists in Next 16 → `tsc --noEmit`
- [x] E3. Untrack `tsconfig.tsbuildinfo`; gitignore
- [x] E4. Security_Guidelines.md: make claims match code (API key hashing, rate limiting scope, extension permissions)
- [-] E5. Mock AI features (ATS, optimize, cover letter) return canned text — product decision
- [-] E6. `apps/admin` is a static mock; docker-compose already says admin lives in web — delete or keep is your call
- [-] E7. 22MB ONNX model as plain git blob — consider Git LFS
