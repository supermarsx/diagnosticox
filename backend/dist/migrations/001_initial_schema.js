"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const database_1 = require("../config/database");
async function up() {
    const db = (0, database_1.getDatabase)();
    // Create organizations table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subdomain TEXT UNIQUE,
      settings TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create users table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'clinician',
      specialty TEXT,
      credentials TEXT,
      preferences TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create patients table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      mrn TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      emergency_contact TEXT,
      primary_provider_id TEXT,
      insurance_info TEXT,
      preferences TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create encounters table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      encounter_type TEXT DEFAULT 'office_visit',
      encounter_date TEXT DEFAULT (datetime('now')),
      chief_complaint TEXT,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create problems table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      encounter_id TEXT,
      problem_name TEXT NOT NULL,
      problem_type TEXT DEFAULT 'symptom',
      onset_date TEXT,
      status TEXT DEFAULT 'active',
      priority INTEGER DEFAULT 0,
      clinical_context TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create hypotheses table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS hypotheses (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      diagnosis_code TEXT,
      diagnosis_name TEXT NOT NULL,
      pretest_probability REAL NOT NULL,
      current_probability REAL NOT NULL,
      evidence_strength TEXT DEFAULT 'moderate',
      clinical_reasoning TEXT,
      supporting_facts TEXT DEFAULT '[]',
      refuting_facts TEXT DEFAULT '[]',
      rank INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create facts table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS facts (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      problem_id TEXT,
      fact_type TEXT NOT NULL,
      measurement_name TEXT NOT NULL,
      measurement_value REAL,
      measurement_unit TEXT,
      value_text TEXT,
      measured_at TEXT NOT NULL,
      source TEXT DEFAULT 'clinical_exam',
      recorded_by TEXT,
      context TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create timeline_events table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      problem_id TEXT,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_name TEXT NOT NULL,
      description TEXT,
      clinical_significance TEXT,
      related_facts TEXT DEFAULT '[]',
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create pivots table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS pivots (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      pivot_name TEXT NOT NULL,
      pivot_type TEXT NOT NULL,
      category TEXT,
      description TEXT,
      measurement_method TEXT,
      threshold_value REAL,
      threshold_unit TEXT,
      threshold_operator TEXT,
      discriminates_between TEXT DEFAULT '[]',
      sensitivity REAL,
      specificity REAL,
      likelihood_ratio_positive REAL,
      likelihood_ratio_negative REAL,
      clinical_context TEXT,
      citations TEXT DEFAULT '[]',
      created_by TEXT,
      is_public INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create test_orders table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS test_orders (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      hypothesis_id TEXT NOT NULL,
      pivot_id TEXT,
      test_name TEXT NOT NULL,
      test_type TEXT,
      tier INTEGER DEFAULT 1,
      pretest_probability REAL,
      expected_posttest_if_positive REAL,
      expected_posttest_if_negative REAL,
      clinical_rationale TEXT,
      ordered_by TEXT NOT NULL,
      ordered_at TEXT NOT NULL,
      status TEXT DEFAULT 'ordered',
      result_received_at TEXT
    )
  `);
    // Create test_results table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      test_order_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      result_value TEXT NOT NULL,
      result_interpretation TEXT,
      numeric_value REAL,
      reference_range TEXT,
      actual_posttest_probability REAL,
      clinical_interpretation TEXT,
      resulted_by TEXT,
      resulted_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create treatment_trials table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS treatment_trials (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      hypothesis_id TEXT,
      trial_name TEXT NOT NULL,
      intervention TEXT NOT NULL,
      intervention_type TEXT NOT NULL,
      dose_schedule TEXT,
      start_date TEXT NOT NULL,
      planned_end_date TEXT,
      actual_end_date TEXT,
      status TEXT DEFAULT 'planned',
      stop_reason TEXT,
      pretreatment_baseline TEXT DEFAULT '{}',
      target_metrics TEXT DEFAULT '[]',
      success_criteria TEXT,
      stop_rules TEXT,
      side_effects_to_monitor TEXT DEFAULT '[]',
      decision_point_reached INTEGER DEFAULT 0,
      decision_outcome TEXT,
      clinical_notes TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create trial_metrics table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS trial_metrics (
      id TEXT PRIMARY KEY,
      trial_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      metric_unit TEXT,
      measured_at TEXT NOT NULL,
      source TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create bias_guardrails table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS bias_guardrails (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      guardrail_type TEXT NOT NULL,
      checkpoint_question TEXT NOT NULL,
      precommit_prediction TEXT,
      alternative_hypotheses TEXT DEFAULT '[]',
      disconfirming_evidence TEXT DEFAULT '[]',
      checkpoint_passed INTEGER,
      clinician_response TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create patient_diary table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS patient_diary (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      symptom_name TEXT,
      severity INTEGER,
      measurement_value REAL,
      measurement_unit TEXT,
      notes TEXT,
      triggers TEXT DEFAULT '[]',
      mood_rating INTEGER,
      activity_level TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create audit_logs table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      user_id TEXT,
      patient_id TEXT,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT,
      changes TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create indexes for performance
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_patients_org ON patients(organization_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_problems_patient ON problems(patient_id, status)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_facts_patient ON facts(patient_id, measured_at)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_timeline_patient ON timeline_events(patient_id, event_date)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_pivots_public ON pivots(is_public, pivot_type)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trials_patient ON treatment_trials(patient_id, status)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_diary_patient ON patient_diary(patient_id, entry_date)`);
    console.log('Database migration completed successfully');
}
async function down() {
    const db = (0, database_1.getDatabase)();
    const tables = [
        'audit_logs', 'patient_diary', 'bias_guardrails', 'trial_metrics',
        'treatment_trials', 'test_results', 'test_orders', 'pivots',
        'timeline_events', 'facts', 'hypotheses', 'problems',
        'encounters', 'patients', 'users', 'organizations'
    ];
    for (const table of tables) {
        await db.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    console.log('Database tables dropped successfully');
}
