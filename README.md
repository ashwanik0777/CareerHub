# Centralized Professional Identity Monorepo Platform

This repository contains the centralized professional identity platform built using a Turborepo monorepo with pnpm workspaces. The layout is optimized to share validation rules, TypeScript models, configuration parameters, database client layers, and UI design components.

## Technology Stack

- **Monorepo Manager:** Turborepo with pnpm workspaces
- **Web Frontend & API Portal:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Admin Dashboard Portal:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Browser Extension Companion:** Manifest V3, Vite, React, TypeScript
- **Database Layer:** Prisma ORM connecting to PostgreSQL
- **Security & Session Auth:** Signed JWT session tokens via HttpOnly cookies
- **Validation Parser:** Zod
- **Icon Library:** Lucide React

---

## Project Workspace Directory Map

```
/
├── apps/
│   ├── web/                     # Next.js SaaS Web App (Dashboard, auth, landing)
│   ├── admin/                   # Next.js Administration Dashboard Panel (SaaS operations)
│   └── extension/               # Chrome Extension Companion (Vite, React)
├── packages/
│   ├── config/                  # Shared compiler configurations
│   ├── db/                      # Shared PostgreSQL Prisma schemas
│   ├── validation/              # Shared Zod forms schema parser rules
│   ├── types/                   # Shared TypeScript models
│   ├── ui/                      # Shared Tailwind CSS design system components
│   ├── utils/                   # Shared logger, date, and error helpers
│   └── api-client/              # Shared unified fetch client with backoff retries
└── docs/
    ├── Documentation.md         # Technical architecture guidelines
    └── Progress_Report.md       # Development progress and log
```

---

## Developer Operations

### 1. Installation
Install all dependencies across the workspace:
```bash
pnpm install
```

### 2. Database Setup
Configure your database credentials as `DATABASE_URL` in `.env` and initialize the schema:
```bash
pnpm --filter @platform/db db:generate
pnpm --filter @platform/db db:push
pnpm --filter @platform/db db:seed
```

### 3. Local Development Start
Launch all portal servers (web at 3000, admin at 3001, extension bundler) concurrently:
```bash
pnpm dev
```

### 4. Compilation Build Check
Check for TypeScript compilation safety and bundle all production assets:
```bash
pnpm build
```
