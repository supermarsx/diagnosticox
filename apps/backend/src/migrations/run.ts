import { up as initialSchema } from './001_initial_schema';
import { up as securitySchema } from './002_security_schema';
import { up as factsUpdatedAt } from './003_add_updated_at_facts';
import { up as multiTenant } from './003_multi_tenancy_rls';
import { up as refreshTokens } from './004_refresh_tokens';
import { up as tokenAudit } from './005_token_audit';
import { up as compositeKeys } from './006_composite_keys';
import { up as patientPivots } from './007_patient_pivots';
import { up as advancedRLS } from './008_advanced_rls';

async function runMigrations() {
  try {
    const logger = (await import('../services/logger.service')).default;
    logger.info('Running database migrations...');
    await initialSchema();
    await securitySchema();
    await factsUpdatedAt();
    // optionally apply multi-tenant / RLS helpers if supported by DB
    await multiTenant();
    // create refresh tokens table
    await refreshTokens();
    // token audit table
    await tokenAudit();
    // composite keys for CockroachDB
    await compositeKeys();
    // patient pivots table
    await patientPivots();
    // advanced RLS with ABAC
    await advancedRLS();
    logger.info('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');
    process.exit(1);
  }
}

runMigrations();
