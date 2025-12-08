import { up as initialSchema } from './001_initial_schema';
import { up as securitySchema } from './002_security_schema';
import { up as factsUpdatedAt } from './003_add_updated_at_facts';
import { up as multiTenant } from './003_multi_tenancy_rls';
import { up as refreshTokens } from './004_refresh_tokens';
import { up as tokenAudit } from './005_token_audit';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await initialSchema();
    await securitySchema();
    await factsUpdatedAt();
    // optionally apply multi-tenant / RLS helpers if supported by DB
    await multiTenant();
    // create refresh tokens table
    await refreshTokens();
    // token audit table
    await tokenAudit();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
