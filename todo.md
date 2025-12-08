# Symptomatology & Long-Horizon DDx App — Implementation TODO

Comprehensive build plan derived from `spec.md`. Organize into phases; mark items as complete during execution.

## Foundations
- [x] Repo setup: confirm pnpm workspace wiring for frontend/backend/mobile; add base env samples with required keys noted.
- [ ] Backend skeleton (Fastify/Nest): project scaffolding, lint/test config, shared types package; enable UTC timestamps.
- [x] Auth/OIDC: PKCE flow, JWT validation with org_id + roles claims; session cache (Redis); idempotency key middleware. (Implemented + tests)
- [ ] Multi-tenancy & RLS: CockroachDB schema with org_id + patient_id composites; per-role policies; seed org/admin user.
- [ ] Core entities: organizations, users, patients, problems, facts tables with validation; migrations + Prisma/TypeORM models.
- [x] Problem list API: CRUD for patients, problems, facts; ETag/If-Match support; pagination + filters.
- [ ] Frontend shell: Vite/React app frame, routing, layout, theme tokens; TanStack Query + auth context + error boundaries.
- [ ] Patient list + overview UI: org/site filters, status chips, problem summaries; tie into patients/facts APIs.
- [ ] Logging & tracing base: structured JSON logger (pino) implemented; correlation IDs / structured request logging middleware added; OpenTelemetry tracing wiring planned. Note: console.* replaced across backend seeds, migrations, RBAC and security controller.
- [ ] CI bootstrap: lint/test/build jobs; Docker Compose dev stack (db, redis, minio stub).
- [x] Add ETag/If-Match concurrency on patients and problems; disable caching on those reads.
- [x] Add ETag/If-Match to facts and add updated_at column via migration; return ETag on create/update.
- [x] Correlation IDs + structured request logging middleware.
- [x] Enforce UTC runtime for backend processes.
- [x] Frontend env validation + sample file for API base URL/tenant/feature flags.
- [x] Root pnpm scripts + README quickstart for workspace commands.

## Timeline & Events
- [] Data model: timeline_events table (step_change, sentinel, trial, test) with metadata; indexes for patient/date.
- [] API: GET/POST timeline per patient; align events to problems when provided.
- [] Charts: timeline view with multi-track series (symptom scores, tests, trials, events); zoom/pan; hover details.
- [] Excel export v1: read-only multi-sheet workbook (problems, facts, timeline) using template; download endpoint.
- [] Imports basic: CSV/Excel validation pipeline; reject partials with clear error report.
- [] Offline caching (web): service worker + IndexedDB/TanStack persister for read models; sync policy draft.

## Pivots, Bayesian Updates, Tiered Testing
- [] Pivots library: seed table with discriminators; filters (system/question); API GET /pivot-library.
- [] Case pivots: attach pivots to patient; record threshold/method, measured_value, meets_threshold, note.
- [] Problem workspace UI: pivot cards, hypothesis ranks (bucketed), overdue badges, next decision date.
- [] Bayesian calculator: UI + util for LR+/LR- -> post-test; batch update per encounter; persist calculations to tests/hypotheses.
- [] Tests planner: tiers 1-3 per problem; rationale text generator; POST /patients/{id}/tests; status lifecycle.
- [] Test results: POST /tests/{id}/results; impact notes auto-suggest; tie to hypothesis rank updates.
- [] Closeout rule: enforce two-domain evidence check before closing problem; guardrails prompt in UI.

## Trials & Diaries
- [] Trials module: trials table/API; configure intervention, dose_regimen, horizon_days, stop_rules, adverse_effects, decision.
- [] Metrics: metrics table + time series store; source enum (device|diary|calc); link to trials/problems.
- [] Trial UI: configure + schedule follow-ups; plot metric deltas; one-click decisions with reasoning snippet.
- [] Mobile diaries MVP: React Native/Expo scaffold; offline cache (SQLite/WatermelonDB); sync endpoints.
- [] Diary inputs: orthostatic HR/BP, Bristol stool chart, pain NRS, sleep log, activity minutes, food triggers; reminders + streaks.
- [] Patient portal views: Today/tasks, My Plan (trials/metrics), History timeline-lite.

## Bias Guardrails, Reporting, Admin
- [] Bias guardrails: bias_checks table/API; capture precommit_note, disconfirming_prediction, result, effect_on_ranks.
- [] Guardrail UI: checkpoint checklist enforcing alt hypotheses + disconfirming prediction; availability prompt injection.
- [] Reporting dashboard: outcomes/cohort filters; GET /reports/outcomes; de-identified summaries.
- [] Admin surfaces: org settings, roles, consent templates, retention policies; audit browser.
- [] Export packs: one-click de-identified packets; configurable field-level redaction.

## Interop & Compliance
- [] Excel full import: schema validation, error report (<1% error target), batch job with progress webhooks.
- [] FHIR read v1: pull Observations/Conditions/DiagnosticReports/MedicationStatements; terminology map per org.
- [] Consent & audit v1: consent table + lifecycle; immutable append-only audit log (read/write + exports) with purpose binding.
- [] RLS hardening: policy review, ABAC option for owner clinician; least-privilege service accounts.
- [] Security passes: P1 vuln scan, SBOM, SLSA level 2 provenance; TLS settings; secret management via vault.

## Future
- [] FHIR write (Observation/Condition/DiagnosticReport/MedicationStatement/Procedure) with MRN/alias resolution.
- [] AI assist module with guardrails (sources shown, clinician confirmation); draft pivot sets, tier-1 tests, timeline summaries.
- [] Advanced analytics: de-identified cohort exports; search index (PG full-text/OpenSearch) for patients/facts.
- [] Enhanced sync: conflict resolution UI (vector clocks), merge review queue.

## Cross-Cutting Tasks
- [] Validation rules: minimum dataset fields, measurement method checklists, bucket enums; server + client schemas (Zod).
- [] Internationalization & accessibility: pt-PT baseline; WCAG 2.2 AA audits; timezone-aware date handling.
- [] Observability: metrics (p95 latency, error rates, job durations, import/export success), alerts (SLO breach, job failures, webhook retries).
- [] Rate limiting & throttling: Redis-backed limits; patient-level export caps.
- [] Testing strategy: unit tests per domain (≥80% core), contract tests for API/webhooks (Pact), Playwright E2E for intake→pivot→tests→trial→checkpoint, migration tests, accessibility checks.
- [] Performance targets: p95 <250ms GET, <1s writes; background jobs <5 min for 10k-row imports; load testing plan.
- [] Data retention & RTBF: soft-delete + delayed purge; per-org policies; export redaction pipeline.
- [] Storage: S3-compatible attachments with server-side encryption; hash integrity checks; signed URLs.
- [] CI/CD: migrations in pipeline, blue-green deploy plan, helm chart for K8s; smoke tests on deploy.

## Deliverable Checkpoints (Acceptance)
- [] Happy path: create patient → add problem → attach ≥2 pivots → plan Tier-1 tests → log results → compute post-test probs → start trial → record metric deltas → reach decision → pass checkpoint.
- [] Import benchmark: 1k-row facts Excel import <2 minutes, error rate <1%.
- [] RBAC/RLS: patients only visible to org clinicians unless consent grants portal access.
- [] Audit: immutable entries for every create/update/delete and all exports, visible in admin audit UI.
