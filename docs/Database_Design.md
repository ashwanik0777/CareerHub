# Database Design Document

## 1. Schema Overview
The relational schema is configured for PostgreSQL using the Prisma ORM. It establishes models for user identity, profile histories, resumes, subscriptions, and OAuth flows.

## 2. Table Normalization and Entity Relationships
- **`User` (1-to-1) `Profile`**: Separates authentication credentials from public resume profiles.
- **`Profile` (1-to-many) `Experience`, `Education`, `Project`, `Skill`, `Certification`, `Award`, `Language`**: Normalizes profile data to prevent duplicate updates.
- **`User` (1-to-many) `Session`**: Enables multi-device session tracking and selective revocation.
- **`User` (1-to-1) `Subscription`**: Tracks billing tiers (`FREE`, `PRO`, `ENTERPRISE`) and quota boundaries.
- **`User` (1-to-many) `OauthClient` & `OauthConsent`**: Manages developer-owned applications and user-approved scope permissions.

## 3. Query Indexing Strategy
To optimize data lookups, `@@index` annotations are applied to foreign key columns:
- **`Experience`, `Education`, `Project`, `Skill`**: Indexed by `profileId` to optimize dashboard renders.
- **`Session`, `ApiKey`, `AuditLog`, `Resume`, `Notification`**: Indexed by `userId` to speed up authentication and logging lookups.
- **`OauthConsent`**: Composite indexes cover `[userId, clientId]`.
