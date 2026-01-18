import { getDatabase } from '../config/database';

export async function up() {
  const db = getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS patient_pivots (
      id TEXT,
      organization_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      problem_id TEXT,
      pivot_id TEXT NOT NULL,
      measured_value REAL,
      meets_threshold INTEGER DEFAULT 0,
      note TEXT,
      recorded_by TEXT,
      recorded_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (organization_id, patient_id, id)
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_patient_pivots_patient ON patient_pivots (organization_id, patient_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_patient_pivots_problem ON patient_pivots (organization_id, problem_id)`);
}

export async function down() {
  const db = getDatabase();
  await db.execute('DROP TABLE IF EXISTS patient_pivots');
}
