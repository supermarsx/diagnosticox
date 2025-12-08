import { up as initialSchema } from './001_initial_schema';
import { up as securitySchema } from './002_security_schema';
import { up as factsUpdatedAt } from './003_add_updated_at_facts';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await initialSchema();
    await securitySchema();
    await factsUpdatedAt();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
