# Repository Guidelines

## Project Structure & Module Organization
- `apps/frontend/`: Vite + React 18 UI, tests under `apps/frontend/src/services/__tests__/`, assets in `apps/frontend/public/`.
- `apps/backend/`: Express + TypeScript prototype API; source in `apps/backend/src/`, env samples in `.env.example`.
- `docs/`: `docs/README.md` index; guides in `docs/guides/`, architecture in `docs/architecture/`, reports in `docs/reports/`, changelog in `docs/records/CHANGELOG.md`.
- `research/`: ICD/DSM/symptom research references.
- Workspace managed by `pnpm-workspace.yaml`; run commands from repo root.

## Build, Test, and Development Commands
- Install: `pnpm install` (root; installs all workspaces).
- Frontend dev: `pnpm --filter diagnosticox-frontend dev` (http://localhost:5173).
- Frontend build: `pnpm --filter diagnosticox-frontend run build:prod`; analyze: `... run build:analyze`; preview: `... run preview`.
- Backend dev (prototype): `pnpm --filter diagnosticox-backend dev`; build: `... run build`; start compiled: `... run start`.
- Lint/format: `pnpm --filter diagnosticox-frontend run lint`, `... run format:check`.

## Coding Style & Naming Conventions
- TypeScript/React with ESLint + Prettier enforced via lint-staged/Husky pre-commit.
- 2-space indentation, single quotes, trailing commas where valid, LF line endings (see `.prettierrc.json`).
- Components PascalCase, hooks `useName`, tests mirror source path with `.test.ts`.

## Testing Guidelines
- Framework: Jest + Testing Library (frontend). Coverage threshold 70%+ (branches/functions/lines/statements).
- Run: `pnpm --filter diagnosticox-frontend run test`, watch: `... run test:watch`, coverage: `... run test:coverage`.
- Place unit tests under `apps/frontend/src/**/__tests__/` or alongside modules.

## Commit & Pull Request Guidelines
- Commit messages follow `<type>: <summary>` (e.g., `feat: Add symptom correlation analysis`, `fix: Resolve cache eviction bug`).
- Keep commits scoped and clean; avoid committing build artifacts (`dist`, `node_modules`).
- PRs: include clear description, linked issue if applicable, steps to test, and screenshots for UI changes. Ensure lint/tests pass before opening.

## Security & Configuration Tips
- Do not commit secrets; use `.env` files (`apps/frontend/.env`, `apps/backend/.env`). Keep API keys out of Git.
- Frontend requires WHO ICD, DrugBank, and AI provider keys; document any new env vars in the relevant `.env.example`.
