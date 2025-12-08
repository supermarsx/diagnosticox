# Tracing and Observability (OpenTelemetry)

This guide documents the prototype OpenTelemetry tracing wiring and logger enrichment added to the Diagnosticox app.

Overview
- Backend: optional dynamic OpenTelemetry initialization is available via `apps/backend/src/services/tracing.service.ts`. When enabled (set `config.tracing.enabled`), the service will attempt to initialize the Node SDK and console export spans (useful in dev). In production you should configure an OTLP exporter (OTLP/collector) and scale accordingly.
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

Notes
- The tracing bootstraps use dynamic imports (try/catch) so missing packages do not break the app. Install the required packages and configure exporters for full tracing.
