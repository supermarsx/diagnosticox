Symptomatology & Long‑Horizon Differential Diagnosis — App Specification (v0.1)

A product, UX, and technical specification for a multi‑tenant web + mobile system that operationalizes the Long‑Horizon DDx Playbook into day‑to‑day clinical workflows.

1) Purpose & Scope

Purpose. Provide a structured, longitudinal workspace to capture symptomatology, step‑changes/sentinel events, pivots, tests, Bayesian updates, treatment trials, and bias guardrails — turning the reasoning playbook into repeatable checklists, timelines, and calculators.

Out of scope. Emergency triage; inpatient order entry; billing; prescribing (for now). The app focuses on non‑emergent, iterative outpatient or research settings.

Platforms. Responsive Web (desktop‑first), Mobile (Android/iOS) for data capture and diaries.

Tenancy. Multi‑org, multi‑site, with row‑level security (RLS) per organization and patient.

2) Personas & Primary Jobs‑To‑Be‑Done (JTBD)

Clinician (Generalist/Specialist). Build problem‑oriented phenotypes, select pivots, plan tiered tests, run trials, and document decision checkpoints.

Researcher/Analyst. Cohort creation, outcome tracking, export de‑identified data.

Patient/Participant. Log symptoms, diaries (orthostatic BP/HR, Bristol chart, pain NRS), complete PROMs, view plan and follow‑ups.

Org Admin. Manage orgs, roles, consent templates, audit, data retention.

3) High‑Level Capabilities

Intake & Modeling: Structured forms for the minimum dataset (demographics, exposures, meds, family hx, lifestyle, psychosocial) with guided ROS.

Timeline: Step‑changes, sentinel events, tests, and interventions aligned to symptom scores; zoomable time series.

Problem List: Phenotype‑oriented problems with ranked etiologies and evidence strength.

Pivots Library: Discriminators with thresholds and measurement methods; attach selected pivots to cases.

Bayesian Calculator: Pretest probability + test LR → post‑test probability; batch update across ordered tests.

Tests Module: Tiered plans, orders (metadata), results, interpretation, impact on hypothesis ranks.

Treatment Trials: Define metrics, horizons, stop rules; capture observed deltas and adverse effects; auto‑generate decisions.

Bias Guardrails: Pre‑commit alternatives, disconfirming predictions, availability prompts; checkpoint enforcement.

Home/Diary Tools: PROMs, orthostatic series, sleep/food triggers; reminders and streaks.

Excel/CSV Interop: Import/export aligned with workbook model; one‑click export packets.

FHIR Interop (Phase 2): Read/write core resources (Observation, Condition, DiagnosticReport, MedicationStatement) for EHR bridges.

Governance: Consent tracking, granular roles/permissions, full audit trail.

4) Information Architecture & Data Model

4.1 Core Entities (ER Outline)

Organization (org_id, name, data_residency, settings)

User (user_id, name, email, locale, tz, org_id, roles[])

Patient (patient_id, org_id, MRN/alias, DOB, sex_at_birth, gender_identity, exposures, lifestyle, psychosocial, contacts)

Encounter (encounter_id, patient_id, date, type, clinician_id, notes)

Problem (problem_id, patient_id, phenotype_label, status, priority, owner_id, next_decision_date)

EtiologyHypothesis (hypothesis_id, problem_id, name, bucket[VINDICATE‑M], rank, evidence_strength)

Fact (fact_id, patient_id, date, domain[history|exam|lab|imaging|device|diary], signal_text, value_num, units, context, reliability, links[], mapped_problem_ids[])

TimelineEvent (event_id, patient_id, date, type[step_change|sentinel|trial|test], title, description, effect_summary)

Pivot (pivot_id, clinical_question, feature, threshold, method, competing_hypotheses[], evidence_level)

CasePivot (case_pivot_id, patient_id, pivot_id, measured_value, meets_threshold[bool], note)

TestOrder (test_id, patient_id, name, tier, date_ordered, rationale, expected_impact, status)

TestResult (result_id, test_id, result_text, value_num, ref_range, interpretation, impact_on_hypotheses)

Trial (trial_id, patient_id, intervention, dose_regimen, start_date, target_metric, horizon_days, stop_rules, adverse_effects, observed_delta, decision)

BiasCheck (check_id, patient_id, bias_type, precommit_note, disconfirming_prediction, result, effect_on_ranks)

Metric (metric_id, patient_id, code, label, unit, source[device|diary|calc], values[time_series])

Attachment (file_id, patient_id, kind[scan|image|pdf], storage_url, hash)

Consent (consent_id, patient_id, purposes[], scope, valid_from, valid_to, signature)

AuditLog (audit_id, actor_id, action, entity_type, entity_id, timestamp, metadata)

Indexes & Constraints. All patient‑scoped tables carry (org_id, patient_id) composite indexes; row‑level policies enforce tenant boundaries.

4.2 Enumerations & Dictionaries

Buckets (Etiologies): vascular, infectious/inflammatory, neoplastic, degenerative/deficiency, iatrogenic/intoxication, congenital/genetic, autoimmune/allergic, traumatic, endocrine/metabolic, functional.

Domains (Facts): history, exam, lab, imaging, device, diary.

Statuses: Active, Resolved, Monitoring.

Evidence Strength: Strong, Moderate, Weak.

5) Key Workflows

5.1 Intake

Guided wizard captures minimum dataset; supports quick‑add facts and immediate problem labeling.

Role‑based progressive disclosure; autosave drafts; offline cache on mobile.

5.2 Timeline & Step‑Changes

Multi‑track time series: symptom scores, tests, trials, events.

Event types: step‑change (discrete jump), sentinel event (pivotal episode), trial, test.

Drag‑to‑align outcomes with events; annotate causal hypotheses.

5.3 Problem‑Oriented Plan

For each problem: ranked hypotheses (with buckets), selected pivots, pending tests, next decision date.

Overdue badges; two‑domain evidence rule enforced at closeout.

5.4 Pivots & Discriminators

Library browser with filters (system, question). Attach to case; set threshold measurement; prompt for confounders.

Pivot cards show effect on close mimics and checklist of measurements.

5.5 Bayesian Updates

Per test: input pretest probability and LR+/LR−; compute post‑test probability and update hypothesis rank.

Batch mode: chain multiple tests in encounter; store calculations for auditability.

5.6 Tiered Testing & Orders

Plan Tiers 1–3 per problem; generate rationale text; log results and automatic impact notes.

Minimum initial panels scaffolded; discourage shotgun ordering via nudge.

5.7 Treatment Trials

Configure intervention, metric (definition), horizon, stop rules; schedule follow‑up.

Auto‑plot metric delta; one‑click decisions (continue/modify/stop) with reasoning snippet.

5.8 Bias Guardrails & Checkpoints

Pre‑commit ≥2 alternatives; capture a disconfirming prediction; checkpoint requires evidence in ≥2 domains before closure.

Availability prompts inject a less‑seen alternative compatible with pivots.

5.9 Patient Diaries & PROMs

Mobile prompts: orthostatic HR/BP series, Bristol stool chart, pain NRS, sleep logs, activity minutes, food triggers.

Reminders with snooze; streaks; clinician‑defined custom metrics.

6) UX & Screen Inventory (Web + Mobile)

Web (clinician)

Dashboard (overdue decisions; active trials; alert queue)

Patient List (filters: org/site, conditions, status)

Patient Workspace

Overview (problems, pivots, upcoming checkpoints)

Timeline (events/tests/trials over time; zoom)

Problems (phenotype boards; hypothesis ranks)

Tests (planner + results)

Trials (metrics & decisions)

Facts (table + quick capture)

Bias Guardrails (checklist view)

Pivot Library (search/filter)

Reports/Export (Excel/CSV, de‑identified packs)

Admin (org settings, roles, consent, audit)

Mobile (patient)

Today (tasks, diaries)

Log Symptom / Vital (guided inputs)

My Plan (trials, metrics)

History (timeline lite)

Settings & Data Sharing

7) API Design (REST‑first; GraphQL optional)

7.1 Conventions

Base path: /api/v1

Auth: OAuth 2.1 / OIDC (Authorization Code + PKCE). Access tokens (JWT) with org_id + role claims.

Pagination: limit, cursor (opaque), default 50.

Filtering: ?patient_id=...&date_gte=...&domain=lab

Idempotency: Idempotency-Key header for POST/PUT.

Concurrency: ETag on resources; If-Match for updates.

7.2 Selected Endpoints

GET /patients, POST /patients, GET /patients/{id}

GET/POST /patients/{id}/problems

GET/POST /patients/{id}/facts

GET/POST /patients/{id}/timeline

GET/POST /patients/{id}/tests, POST /tests/{id}/results

GET/POST /patients/{id}/trials

GET/POST /patients/{id}/pivots (attach/measure)

GET/POST /patients/{id}/bias-checks

GET /pivot-library (static/managed content)

POST /import/excel, GET /export/excel?patient_id=...

GET /reports/outcomes?cohort=...

7.3 Webhooks (optional)

trial.updated, test.result.created, checkpoint.due, consent.revoked — HMAC‑signed.

7.4 FHIR Bridges (Phase 2)

Read/Write: Observation, Condition, DiagnosticReport, MedicationStatement, Procedure.

Identity resolution by MRN/alias map; per‑org terminology map.

8) Architecture

Frontend. React (TypeScript) or Next.js App Router; state via TanStack Query; charts via Recharts or Apache ECharts; form engine with Zod + React Hook Form.

Mobile. React Native (Expo) or Flutter; offline cache (SQLite/WatermelonDB) with delta sync.

Backend. TypeScript (NestJS/Fastify) or Python (FastAPI). Domain modules per entity. Background workers (BullMQ/Celery) for imports, exports, notifications.

Database. CockroachDB (cloud or self‑hosted) — strong RLS patterns, timestamps in UTC, time‑zones per user. JSONB columns for flexible signals; strict tables for core entities.

Storage. Object store (S3‑compatible) for attachments; server‑side encryption.

Search. Postgres full‑text or OpenSearch for patient/fact search.

Caching. Redis for sessions, rate limiting, idempotency, jobs.

Infra. Docker Compose for dev; K8s for prod; helm chart; CI/CD with migrations; blue‑green deploy.

Offline & Sync. Client caches events and facts; vector clocks or last‑write‑wins with audit trail; conflict UI for merges.

9) Security, Privacy, Compliance

AuthN/Z. OIDC + RBAC (OrgAdmin, Clinician, Researcher, Patient). Optional row‑level ABAC (owner clinician).

Data Security. TLS 1.3; encryption at rest; key rotation; secrets in vault.

RLS. Row‑level security per org and patient; least‑privilege service accounts.

Audit. Immutable append‑only audit log for read/write events with actor, purpose, and legal basis.

Consent & Purpose Binding. Track processing purposes; consent lifecycle; per‑purpose access checks.

Data Minimization. Configurable field‑level redaction for exports; de‑identification pipeline.

Retention & Right‑to‑be‑Forgotten. Per‑org policies; soft‑delete + delayed purge.

Localization & Accessibility. i18n with pt‑PT baseline; WCAG 2.2 AA; date/time aware of user TZ.

10) Import/Export & Excel Interop

Export a multi‑sheet workbook: Problem List, Facts, Tests, Trials, Pivots, Bias, Timeline.

Import from validated template (schema checked; reject partials with error report).

CSV & JSON endpoints for bulk ops.

11) Observability & Logging

Metrics. API latency (p95), error rates, job durations, export/import success.

Tracing. OpenTelemetry traces for high‑latency flows (import, export, FHIR sync).

Logs. Structured JSON; correlation IDs; PII‑aware logging; redaction on sinks.

Alerts. SLO breach, job failures, webhook retries exhausted; Pager & email hooks.

12) Non‑Functional Requirements (NFRs)

Performance. p95 API < 250 ms for standard GETs; < 1 s for writes; background jobs < 5 min for 10k‑row imports.

Availability. 99.9% monthly; graceful degrade of charts.

Capacity. 100k patients, 10M facts per org; horizontal scale at DB and worker tiers.

Security. No P1 vulns; quarterly pen‑tests; SBOM and SLSA level 2 build provenance.

13) Validation & Testing Strategy

Unit tests per domain module (≥80% coverage targets on core logic).

Contract tests for API; Pact for webhook consumers.

E2E (Playwright) covering: intake → pivots → tests → trial → checkpoint close.

Data migration tests with fixtures; rollback drills.

UAT scripts for clinicians; accessibility audits.

14) Configuration & Feature Flags

Feature flags: FHIR sync, AI assist, de‑identification export, strict guardrails.

Org‑level settings: default pivot sets, diary instruments, retention policies.

15) AI Assist (Optional Module)

Use cases. Draft pivot sets from facts; suggest Tier‑1 tests with LR notes; summarize timeline changes; draft clinic note.

Guardrails. Always show sources and require clinician confirmation; never auto‑order or auto‑close problems.

Privacy. Choice of on‑prem or privacy‑preserving gateway; prompt redaction; PHI filtering.

16) Delivery Plan & Milestones (6–8 months)

M1 (Month 1) — Foundations: Auth, orgs, patients, problem list, facts table.

M2 — Timeline & events; Excel export (read‑only); basic imports; charts.

M3 — Pivots library; Bayesian calculator; tiered test planner.

M4 — Trials module with metrics and decisions; mobile diaries MVP.

M5 — Bias guardrails; checkpoint enforcement; reporting dashboard.

M6 — Interop: Excel full import; FHIR read (pull Observations); consent & audit v1.

M7+ — FHIR write; AI assist; de‑identified cohort exports; advanced analytics.

17) Acceptance Criteria (Representative)

Create patient → add problem → attach ≥2 pivots → plan Tier‑1 tests → log results → compute post‑test probabilities → start a trial → record metric deltas → reach a decision → pass checkpoint.

Import Excel with ≥1k rows of facts in < 2 minutes with error report ≤1%.

RBAC enforces: patients visible only to org members with clinician role unless consent grants patient portal access.

Audit log contains immutable entries for each create/update/delete and all exports.

18) Risks & Mitigations

Data quality drift. Mitigation: validation rules, required fields, measurement method checklists.

Timeline clutter. Mitigation: tracks/layers, filters, auto‑grouping by episode.

Sync conflicts. Mitigation: vector clocks, merge UI, strict audit history.

Privacy breaches. Mitigation: PII scanning on exports, consent checks, least‑privilege keys.

19) Glossary (Selected)

Pivot: High‑information feature separating close mimics (with threshold and method).

Step‑change: Discrete jump in severity/function after an event.

Sentinel event: Pivotal episode changing risk/pathophysiology.

Pre/ Post‑test probability: Bayesian update context around diagnostic testing.

Appendix — Sample Payloads

POST /patients/{id}/pivots (attach + measure)

{
  "pivot_id": "inflammatory_vs_mechanical_arthropathy",
  "measured_value": 90,
  "meets_threshold": true,
  "note": "Morning stiffness >60 min with warm MCPs."
}

POST /patients/{id}/trials

{
  "intervention": "Iron supplementation",
  "dose_regimen": "Ferrous sulfate 65mg elemental iron qod",
  "start_date": "2025-09-07",
  "target_metric": "PROMIS_Fatigue",
  "horizon_days": 28,
  "stop_rules": "Discontinue if no ≥2‑point improvement or GI intolerance",
  "adverse_effects": null
}

