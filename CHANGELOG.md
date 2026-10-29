# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-01

### Added
- Created a pluggable, provider-agnostic `AiService` adapter engine supporting mock implementations for resume optimization, ATS evaluation, cover letter tailoring, and job description scoring.
- Created Next.js API endpoints under `/api/ai/` calling optimization and matching routines.
- Created Developer API v1 gateway `/api/v1/profile` authorized via `ApiKey` headers.
- Created OAuth 2.0 SSO API endpoints supporting developer app registration, user consent authorization, and access token exchange.
- Added database relational performance indexes (`@@index`) to schema schemas.
- Configured a database seeding script (`seed.js`) to set up initial testing and administrative accounts in PostgreSQL.
- Implemented client IP-based Token Bucket rate limiting middleware protecting public API paths.
- Integrated security response headers (CSP, HSTS, X-Content-Type-Options) inside Next.js middlewares.
- Added root `Dockerfile` and `docker-compose.yml` for database, web, and admin setups.
- Added a GitHub Actions workflow `.github/workflows/ci.yml`.

### Changed
- Decoupled all hardcoded brand naming references and centralized configuration parameters in `packages/utils/src/branding.ts`.
- Renamed all package configurations and workspaces from `@careerhub/*` to brand-neutral `@platform/*` names.
- Updated all monorepo source imports and file links to target `@platform/*` namespaces.
