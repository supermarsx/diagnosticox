# Tracing and Observability (OpenTelemetry)

This guide documents the prototype OpenTelemetry tracing wiring and logger enrichment added to the Diagnosticox app.

Overview
- Backend: optional dynamic OpenTelemetry initialization is available via `apps/backend/src/services/tracing.service.ts`. To enable tracing set the environment variable `TRACING_ENABLED=true` (or configure `config.tracing.enabled`). When enabled the service will attempt to initialize the Node SDK and console export spans (useful in dev). In production you should configure an OTLP exporter (OTLP/collector) and scale accordingly.
- Frontend: optional browser tracing initialization is available at `apps/frontend/src/services/tracing.ts`. Set `VITE_ENABLE_TRACING=true` to enable the browser-side tracer. This currently uses the Console exporter in the prototype — you should wire OTLP/collector or a SaaS exporter for production.
	- Enable: Vite environment: VITE_ENABLE_TRACING=true

Log enrichment
- Request logging has been extended (`apps/backend/src/middleware/request-context.middleware.ts`) to include correlation IDs, optional trace/span ids (when OTEL is present), and session + organization claims extracted from incoming JWTs (decoded without verification for contextual logging).
- The backend `logger` child instances are attached onto `req.logger` so downstream handlers / controllers can log with enriched fields.

Headers and context
- Frontend requests attempt to attach `traceparent` and `X-Session-Id` / `X-Org-Id` headers when the current tracing context and session information are available. This helps propagate trace context to backend services.

Next steps (recommended)
 - Wire an OTLP exporter in backend (e.g., OTLP gRPC/HTTP to a collector) and configure env-protected endpoint
 - Add sampling / resource attributes (service name, env, version)
 - Add a centralized tracing dashboard (Jaeger/Tempo/OTEL collector) and CI smoke test to ensure traces flow

 
CI smoke test

- A GitHub Actions workflow has been added at `.github/workflows/tracing-smoke.yml` that boots a Jaeger all-in-one container, starts the backend with `TRACING_ENABLED=true` and `TRACING_OTLP_ENDPOINT=http://localhost:4318/v1/traces`, triggers an instrumented endpoint and queries the Jaeger API to assert traces were ingested. This provides a simple end-to-end check that tracing and OTLP export are wired correctly in CI.

CI validation

- The CI workflow now runs an OTEL Collector + Tempo + Grafana, triggers an instrumented endpoint and queries Tempo's trace API to assert the `auth.register` span exists and includes required attributes (`session.id` and `user.id`). The workflow also imports a static dashboard and creates a Grafana snapshot which is archived as a CI artifact for later inspection.

Local developer testing

You can run the local tracing/dev infra with docker-compose (file at `docker-compose.dev.yml`) and then start the backend pointing to the local jaeger collector:

```pwsh
docker compose -f docker-compose.dev.yml up -d
# In another shell
$env:TRACING_ENABLED='true'
$env:TRACING_OTLP_ENDPOINT='http://localhost:4318/v1/traces'
pnpm --filter diagnosticox-backend dev
```

Then visit Jaeger's UI at [http://localhost:16686](http://localhost:16686) to inspect traces and spans.

Light local mode (sqlite)

If you want a minimal 'light' mode for local development (no Postgres/Redis/MinIO), use the provided helper to start both backend + frontend using sqlite:

```pwsh
pnpm dev:light
```

This will start the backend in sqlite mode (DB_TYPE=sqlite) and run the frontend dev server — convenient for quick development and debugging.

Grafana provisioning

For local CI-like runs the repository includes Grafana provisioning files under `.github/tracing/grafana/` which pre-provisions a Tempo datasource and a minimal Diagnosticox traces dashboard. When running Grafana in CI or locally mount that directory into the Grafana container at `/etc/grafana/provisioning` and `/var/lib/grafana/dashboards` so the dashboard and datasource are loaded automatically.

Notes

- The tracing bootstraps use dynamic imports (try/catch) so missing packages do not break the app. Install the required packages and configure exporters for full tracing.
