import { getDatabase } from '../config/database';
import { config } from '../config';

export async function up() {
  const db = getDatabase();

  // Add indexes that help tenant-scoped queries
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_patients_org_id ON patients (organization_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_problems_org_patient ON problems (organization_id, patient_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_facts_org_patient ON facts (organization_id, patient_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_hypotheses_org_problem ON hypotheses (organization_id, problem_id)`);

  if (config.database.type === 'postgresql') {
    // Create example RLS policies for PostgreSQL / CockroachDB.
    // These policies rely on session settings being set by the application before queries:
    // SET app.organization_id = 'org-id'; SET app.role = 'clinician' / 'admin';
    // Example policy: allow rows where organization_id matches the session or when role=admin.

    const rlsTables = ['patients', 'problems', 'facts', 'hypotheses', 'encounters'];

    for (const t of rlsTables) {
      // Enable RLS
      await db.execute(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);

      // Allow select/update/delete only when organization matches OR role is admin
      await db.execute(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'org_isolation') THEN
            CREATE POLICY org_isolation ON ${t} USING (organization_id = current_setting('app.organization_id', true)::text OR current_setting('app.role', true)::text = 'admin');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'org_check') THEN
            CREATE POLICY org_check ON ${t} FOR INSERT WITH CHECK (organization_id = current_setting('app.organization_id', true)::text OR current_setting('app.role', true)::text = 'admin');
          END IF;
        END
        $$;
      `);
    }
  }
}

export async function down() {
  const db = getDatabase();
  await db.execute('DROP INDEX IF EXISTS idx_patients_org_id');
  await db.execute('DROP INDEX IF EXISTS idx_problems_org_patient');
  await db.execute('DROP INDEX IF EXISTS idx_facts_org_patient');
  await db.execute('DROP INDEX IF EXISTS idx_hypotheses_org_problem');

  if (config.database.type === 'postgresql') {
    const rlsTables = ['patients', 'problems', 'facts', 'hypotheses', 'encounters'];
    for (const t of rlsTables) {
      try {
        await db.execute(`ALTER TABLE ${t} DISABLE ROW LEVEL SECURITY`);
        await db.execute(`DROP POLICY IF EXISTS org_isolation ON ${t}`);
        await db.execute(`DROP POLICY IF EXISTS org_check ON ${t}`);
      } catch (err) {
        // best-effort cleanup
      }
    }
  }
}
