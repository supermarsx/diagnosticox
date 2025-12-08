# Auth & Tenancy Quickstart

## Bootstrap (fresh install)
- Endpoint: `POST /api/auth/bootstrap`
- Body: `{ "org_name": "Acme Health", "admin_email": "admin@acme.com", "admin_password": "strong-pass", "admin_full_name": "Admin User" }`
- Effect: Creates the first organization + admin user and returns a JWT scoped to that org. Allowed only when no users exist.

## Login & Registration
- Login: `POST /api/auth/login` with `{ email, password }` → returns JWT with `organizationId`, `userId`, `role`.
- Register (existing org): `POST /api/auth/register` with `{ email, password, full_name, organization_id, role }`. Fails if org is missing.

## Org Management
- Create org (admin only): `POST /api/security/organizations` with `{ name, subdomain?, settings? }`.
- List org (scoped): `GET /api/security/organizations` returns only the caller’s org.

## Tenant Enforcement
- All protected routes require `Authorization: Bearer <JWT>`.
- Optional `x-org-id` must match the JWT’s `organizationId`; body `organization_id` is normalized server-side.
- Patient-scoped routes verify the patient belongs to the caller’s org.

## RBAC Defaults
- `admin`: full write (patients/problems/trials/timeline/diary), org creation.
- `clinician`: write to clinical resources, no org creation.
- Others: read-only unless expanded later.

## Audit Logging
- Writes to patients, problems, timeline events, diary entries, trials/metrics emit audit rows (org/user/patient scoped) with IP/user-agent when available.

## Pivot Library & Bias Guardrails
- Pivots: `GET /api/pivots` (public + org), filters `type`, `category`, `is_public`; create via `POST /api/pivots` (admin/clinician).
- Bias guardrails: `GET /api/bias/patient/:patientId`; record checkpoint via `POST /api/bias` with guardrail type, checkpoint question, alternatives/disconfirming evidence.
- Facts: `GET /api/facts/patient/:patientId` to list clinical signals; create/update/delete via `POST /api/facts`, `PUT /api/facts/:id`, `DELETE /api/facts/:id` (admin/clinician writes, admin delete).
- Export: `GET /api/export/patient/:patientId?format=json|csv` returns patient bundle (JSON) or facts CSV; scoped to caller org.
- FHIR (Phase 2 stub): `GET /api/fhir/patients/:patientId/observations|conditions` maps internal facts/problems to FHIR resources; `POST /api/fhir/observations` ingests an Observation into facts (admin/clinician).
- Import (CSV): `POST /api/import/facts` with `text/csv` body (headers: patient_id,problem_id,fact_type,measurement_name,measurement_value,measurement_unit,value_text,measured_at,source); org/patient scoped and audited.
- Reporting: `GET /api/reports/outcomes?cohort=...` returns org-scoped counts (patients, problems, trials, observations).

## Environment
- JWT secret: `JWT_SECRET`
- Allowed origins: `ALLOWED_ORIGINS`
- SQLite path: `SQLITE_DB_PATH=./research/medical_diagnosis.db`
