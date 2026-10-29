# Quality Assurance Testing Strategy

## 1. Scope of Testing
The testing strategy covers:
- **Unit Testing**: Verifies profile scoring and ATS match engines.
- **API Boundary Tests**: Verifies OAuth consent tokens and API key checks.
- **Build Checks**: Prevents syntax regressions in monorepo workspaces.

## 2. Test Execution Operations
Run the unit test suite:
```bash
pnpm test
```
Run type-checking validation:
```bash
pnpm build
```

## 3. Automation CI Integration
The CI pipeline on GitHub Actions (`.github/workflows/ci.yml`) runs on push and pull request hooks to:
1. Verify node module dependency locks.
2. Initialize database schema generation.
3. Validate overall monorepo builds.
