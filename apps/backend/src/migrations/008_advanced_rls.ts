import { getDatabase } from '../config/database';
import { config } from '../config';

/**
 * Migration: 008_advanced_rls
 * 
 * Hardens RLS policies with ABAC (Attribute-Based Access Control) options.
 * Allows clinicians to access records if they are the primary provider 
 * or creator, even if not an admin.
 */
export async function up() {
  const db = getDatabase();

  if (config.database.type === 'postgresql') {
    // 1. Update patients policy to allow primary_provider_id access
    await db.execute(`
      DROP POLICY IF EXISTS org_isolation ON patients;
      CREATE POLICY org_isolation ON patients USING (
        organization_id = current_setting('app.organization_id', true)::text 
        AND (
          current_setting('app.role', true)::text = 'admin' OR 
          current_setting('app.role', true)::text = 'physician' OR
          primary_provider_id = current_setting('app.user_id', true)::text
        )
      );
    `);

    // 2. Update problems/facts to allow access if created_by matches session user
    const clinicalTables = ['problems', 'facts', 'timeline_events', 'treatment_trials'];
    for (const t of clinicalTables) {
      await db.execute(`
        DROP POLICY IF EXISTS org_isolation ON ${t};
        CREATE POLICY org_isolation ON ${t} USING (
          organization_id = current_setting('app.organization_id', true)::text 
          AND (
            current_setting('app.role', true)::text = 'admin' OR 
            created_by = current_setting('app.user_id', true)::text
          )
        );
      `);
    }
  }
}

export async function down() {
  // Reverting would involve restoring the simpler 003 policies.
}
