## diagnosticox-backend (scaffolding notes)

Quick notes for developers working on the backend package in this monorepo.

- The repository uses a small `@diagnosticox/shared-types` package for shared TypeScript interfaces — build that package before compiling the backend. The backend `build` script runs the shared types build automatically:

```bash
pnpm --filter diagnosticox-backend run build
```

- The backend enforces UTC as the runtime timezone by setting `process.env.TZ = 'UTC'` in `src/index.ts` so timestamps are stable across environments.

- Linting and tests:

```bash
pnpm --filter diagnosticox-backend run lint
pnpm --filter diagnosticox-backend run test
```

If you are iterating on the shared-types package you can build it directly with:

```bash
pnpm --filter @diagnosticox/shared-types run build
```

If anything fails, confirm your workspace has installed dependencies and that `pnpm` runs from the repo root.
