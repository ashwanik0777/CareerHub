# Production Deployment Manual

## 1. Containerization Topology
The platform is packaged into multi-stage Docker builds:
- **Build Stage**: Installs development dependencies via `pnpm install --frozen-lockfile` and compiles Next.js pages.
- **Production Runner**: Packages minimal Node.js runtimes.

## 2. Configuration Parameters
Ensure the following variables are populated in the production environment:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Minimum 32-character key for session sign-offs.
- `NODE_ENV`: Must be set to `production`.

## 3. Database Sync Procedures
Run database table generators and migrations before starting production containers:
```bash
pnpm --filter @platform/db db:generate
pnpm --filter @platform/db db:push
```
To populate standard platform templates and plans, execute the seed runner:
```bash
pnpm --filter @platform/db db:seed
```
