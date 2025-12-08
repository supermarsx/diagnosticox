# Development Stack (Docker Compose)

This repository includes a small Docker Compose file for local development that brings up a Postgres database, Redis, and a MinIO S3-compatible store.

Start the development infra from the repository root:

```pwsh
pnpm run dev:infra
```

Stop and remove containers:

```pwsh
pnpm run down:infra
```

Environment variables for the backend are configured via `apps/backend/.env.example`. When using the compose stack you can set the following (defaults are used in the compose file):

- POSTGRES_HOST=localhost
- POSTGRES_PORT=5432
- POSTGRES_DB=diagnosticox_dev
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=postgres
- REDIS_URL=redis://localhost:6379
- MINIO_ROOT_USER=minioadmin
- MINIO_ROOT_PASSWORD=minioadmin

The compose stack is intended for development and CI integration/testing. It is not for production use.
