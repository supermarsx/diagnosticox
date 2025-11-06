# Medical Diagnosis Application - Database Schema

## Overview
Multi-tenant PostgreSQL database schema supporting sophisticated medical diagnosis workflows with Bayesian probability calculations, treatment trials, and clinical decision support.

## Core Tables

### 1. organizations
Multi-tenant support for healthcare organizations.
```sql
- id: UUID PRIMARY KEY
- name: TEXT NOT NULL
- subdomain: TEXT UNIQUE
- settings: JSONB (organization preferences)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 2. users
Clinicians and administrative users.
```sql
- id: UUID PRIMARY KEY (references auth.users)
- organization_id: UUID NOT NULL
- email: TEXT UNIQUE NOT NULL
- full_name: TEXT NOT NULL
- role: TEXT (clinician, admin, resident)
- specialty: TEXT
- credentials: TEXT
- preferences: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 3. patients
Patient records with demographics and identifiers.
```sql
- id: UUID PRIMARY KEY
- organization_id: UUID NOT NULL
- mrn: TEXT (medical record number)
- first_name: TEXT NOT NULL
- last_name: TEXT NOT NULL
- date_of_birth: DATE NOT NULL
- gender: TEXT
- contact_phone: TEXT
- contact_email: TEXT
- emergency_contact: JSONB
- primary_provider_id: UUID
- insurance_info: JSONB
- preferences: JSONB (patient app settings)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 4. encounters
Clinical encounters and visits.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- provider_id: UUID NOT NULL
- encounter_type: TEXT (office_visit, telehealth, hospital, emergency)
- encounter_date: TIMESTAMPTZ NOT NULL
- chief_complaint: TEXT
- status: TEXT (scheduled, in_progress, completed, cancelled)
- notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 5. problems
Problem-oriented diagnosis list with ranked hypotheses.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- encounter_id: UUID
- problem_name: TEXT NOT NULL
- problem_type: TEXT (symptom, sign, syndrome, diagnosis)
- onset_date: DATE
- status: TEXT (active, resolved, ruled_out)
- priority: INTEGER (ranking)
- clinical_context: TEXT
- created_by: UUID NOT NULL
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 6. hypotheses
Differential diagnosis hypotheses with probability tracking.
```sql
- id: UUID PRIMARY KEY
- problem_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- diagnosis_code: TEXT (ICD-10, SNOMED)
- diagnosis_name: TEXT NOT NULL
- pretest_probability: DECIMAL(5,4) (0.0000 to 1.0000)
- current_probability: DECIMAL(5,4)
- evidence_strength: TEXT (definitive, strong, moderate, weak, against)
- clinical_reasoning: TEXT
- supporting_facts: TEXT[]
- refuting_facts: TEXT[]
- rank: INTEGER
- status: TEXT (active, confirmed, ruled_out)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 7. facts
Time-series medical data and observations.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- problem_id: UUID
- fact_type: TEXT (vital_sign, lab_result, symptom, physical_exam, history)
- measurement_name: TEXT NOT NULL
- measurement_value: DECIMAL
- measurement_unit: TEXT
- value_text: TEXT
- measured_at: TIMESTAMPTZ NOT NULL
- source: TEXT (patient_diary, clinical_exam, lab, device)
- recorded_by: UUID
- context: JSONB
- created_at: TIMESTAMPTZ
```

### 8. timeline_events
Key events in patient timeline (step-changes, sentinel events, trials).
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- problem_id: UUID
- event_type: TEXT (step_change, sentinel_event, trial_start, trial_end, test_ordered, test_result)
- event_date: TIMESTAMPTZ NOT NULL
- event_name: TEXT NOT NULL
- description: TEXT
- clinical_significance: TEXT
- related_facts: UUID[]
- created_by: UUID NOT NULL
- created_at: TIMESTAMPTZ
```

### 9. pivots
Pivot library with discriminators and thresholds.
```sql
- id: UUID PRIMARY KEY
- organization_id: UUID NOT NULL
- pivot_name: TEXT NOT NULL
- pivot_type: TEXT (symptom, sign, lab_test, imaging, procedure)
- category: TEXT
- description: TEXT
- measurement_method: TEXT
- threshold_value: DECIMAL
- threshold_unit: TEXT
- threshold_operator: TEXT (greater_than, less_than, equal_to, between)
- discriminates_between: TEXT[]
- sensitivity: DECIMAL(4,3)
- specificity: DECIMAL(4,3)
- likelihood_ratio_positive: DECIMAL(8,3)
- likelihood_ratio_negative: DECIMAL(8,3)
- clinical_context: TEXT
- references: TEXT[]
- created_by: UUID
- is_public: BOOLEAN DEFAULT true
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 10. test_orders
Test orders with Bayesian probability calculations.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- problem_id: UUID NOT NULL
- hypothesis_id: UUID NOT NULL
- pivot_id: UUID
- test_name: TEXT NOT NULL
- test_type: TEXT
- tier: INTEGER (1, 2, 3)
- pretest_probability: DECIMAL(5,4)
- expected_posttest_if_positive: DECIMAL(5,4)
- expected_posttest_if_negative: DECIMAL(5,4)
- clinical_rationale: TEXT
- ordered_by: UUID NOT NULL
- ordered_at: TIMESTAMPTZ NOT NULL
- status: TEXT (ordered, completed, cancelled)
- result_received_at: TIMESTAMPTZ
```

### 11. test_results
Test results with Bayesian updates.
```sql
- id: UUID PRIMARY KEY
- test_order_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- result_value: TEXT NOT NULL
- result_interpretation: TEXT (positive, negative, indeterminate)
- numeric_value: DECIMAL
- reference_range: TEXT
- actual_posttest_probability: DECIMAL(5,4)
- clinical_interpretation: TEXT
- resulted_by: UUID
- resulted_at: TIMESTAMPTZ NOT NULL
- created_at: TIMESTAMPTZ
```

### 12. treatment_trials
Treatment trials with stop rules and decision points.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- problem_id: UUID NOT NULL
- hypothesis_id: UUID
- trial_name: TEXT NOT NULL
- intervention: TEXT NOT NULL
- intervention_type: TEXT (medication, therapy, procedure, lifestyle)
- dose_schedule: TEXT
- start_date: DATE NOT NULL
- planned_end_date: DATE
- actual_end_date: DATE
- status: TEXT (planned, active, completed, stopped)
- stop_reason: TEXT
- pretreatment_baseline: JSONB
- target_metrics: TEXT[]
- success_criteria: TEXT
- stop_rules: TEXT
- side_effects_to_monitor: TEXT[]
- decision_point_reached: BOOLEAN DEFAULT false
- decision_outcome: TEXT
- clinical_notes: TEXT
- created_by: UUID NOT NULL
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 13. trial_metrics
Treatment trial metric tracking over time.
```sql
- id: UUID PRIMARY KEY
- trial_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- metric_name: TEXT NOT NULL
- metric_value: DECIMAL NOT NULL
- metric_unit: TEXT
- measured_at: TIMESTAMPTZ NOT NULL
- source: TEXT (patient_diary, clinical_measurement)
- notes: TEXT
- created_at: TIMESTAMPTZ
```

### 14. bias_guardrails
Bias checkpoint system with pre-commit alternatives.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- problem_id: UUID NOT NULL
- guardrail_type: TEXT (diagnostic_anchoring, premature_closure, availability_bias)
- checkpoint_question: TEXT NOT NULL
- precommit_prediction: TEXT
- alternative_hypotheses: TEXT[]
- disconfirming_evidence: TEXT[]
- checkpoint_passed: BOOLEAN
- clinician_response: TEXT
- created_by: UUID NOT NULL
- created_at: TIMESTAMPTZ
```

### 15. patient_diary
Patient diary entries for symptom tracking.
```sql
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL
- organization_id: UUID NOT NULL
- entry_date: TIMESTAMPTZ NOT NULL
- entry_type: TEXT (symptom, medication, vital_sign, pain_scale, mood, activity)
- symptom_name: TEXT
- severity: INTEGER (1-10 scale)
- measurement_value: DECIMAL
- measurement_unit: TEXT
- notes: TEXT
- triggers: TEXT[]
- mood_rating: INTEGER
- activity_level: TEXT
- created_at: TIMESTAMPTZ
```

### 16. audit_logs
Comprehensive audit logging for compliance.
```sql
- id: UUID PRIMARY KEY
- organization_id: UUID NOT NULL
- user_id: UUID
- patient_id: UUID
- action: TEXT NOT NULL
- table_name: TEXT NOT NULL
- record_id: UUID
- changes: JSONB
- ip_address: TEXT
- user_agent: TEXT
- created_at: TIMESTAMPTZ NOT NULL
```

## Indexes

Key indexes for performance:
- Patient lookup: patient_id, mrn, organization_id
- Problem tracking: patient_id, status, created_at
- Timeline queries: patient_id, event_date
- Pivot search: pivot_name, category, is_public
- Trial tracking: patient_id, status, start_date
- Diary queries: patient_id, entry_date

## Row-Level Security (RLS)

All tables implement multi-tenant RLS:
- Users can only access data from their organization
- Patients can access their own diary entries
- Clinicians can access patients in their organization
- All policies allow both 'anon' and 'service_role' roles

## Offline Capability Strategy

Frontend will use IndexedDB for offline storage:
- Cache patient data for offline access
- Queue diary entries when offline
- Sync changes when connection restored
- Use service workers for PWA functionality
