import { up as initialSchema } from './001_initial_schema';
import { up as securitySchema } from './002_security_schema';
import { up as factsUpdatedAt } from './003_add_updated_at_facts';
import { up as multiTenant } from './003_multi_tenancy_rls';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await initialSchema();
    await securitySchema();
    await factsUpdatedAt();
    // optionally apply multi-tenant / RLS helpers if supported by DB
    await multiTenant();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
