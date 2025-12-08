import { getDatabase, IDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

async function seedSecurityDataOnly() {
  const db = getDatabase();
  console.log('Seeding security data only...');

  try {
    // Get existing user IDs
    const users = await db.query('SELECT id FROM users LIMIT 10');
    if (users.length === 0) {
      console.error('No users found in database. Please run main seed first.');
      process.exit(1);
    }
    const userIds = users.map((u: any) => u.id);

    // Clear existing security data to avoid duplicates
    console.log('Clearing existing security data...');
    await db.execute('DELETE FROM user_roles');
    await db.execute('DELETE FROM departments');
    await db.execute('DELETE FROM auth_methods');
    await db.execute('DELETE FROM audit_logs');
    await db.execute('DELETE FROM encryption_keys');
    await db.execute('DELETE FROM consent_records');
    await db.execute('DELETE FROM security_policies');

    // 1. Assign roles to existing users
    console.log('Assigning roles to users...');
    const userRoles = [
      { user_id: userIds[0], role_id: 1 },
      { user_id: userIds[1] || userIds[0], role_id: 2 },
      { user_id: userIds[2] || userIds[0], role_id: 3 },
      { user_id: userIds[3] || userIds[0], role_id: 4 },
      { user_id: userIds[4] || userIds[0], role_id: 5 },
      { user_id: userIds[5] || userIds[0], role_id: 6 },
      { user_id: userIds[6] || userIds[0], role_id: 7 },
      { user_id: userIds[7] || userIds[0], role_id: 8 },
    ];

    for (const role of userRoles) {
      await db.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [role.user_id, role.role_id]
      );
    }

    // 2. Create departments
    console.log('Creating departments...');
    const departments = [
      { id: uuidv4(), name: 'Emergency Medicine', manager_id: userIds[2] || userIds[0], budget: 3500000, staff_count: 42, location: 'Building A, Floor 1' },
      { id: uuidv4(), name: 'Internal Medicine', manager_id: userIds[3] || userIds[0], budget: 2800000, staff_count: 35, location: 'Building B, Floor 2' },
      { id: uuidv4(), name: 'Cardiology', manager_id: userIds[4] || userIds[0], budget: 3200000, staff_count: 28, location: 'Building B, Floor 3' },
      { id: uuidv4(), name: 'Neurology', manager_id: userIds[2] || userIds[0], budget: 2900000, staff_count: 31, location: 'Building C, Floor 2' },
      { id: uuidv4(), name: 'Pediatrics', manager_id: userIds[3] || userIds[0], budget: 2600000, staff_count: 38, location: 'Building A, Floor 3' },
      { id: uuidv4(), name: 'Radiology', manager_id: userIds[4] || userIds[0], budget: 4100000, staff_count: 25, location: 'Building D, Floor 1' },
      { id: uuidv4(), name: 'Laboratory', manager_id: userIds[2] || userIds[0], budget: 2200000, staff_count: 29, location: 'Building D, Floor 2' },
      { id: uuidv4(), name: 'Surgery', manager_id: userIds[3] || userIds[0], budget: 3800000, staff_count: 33, location: 'Building C, Floor 4' },
    ];

    for (const dept of departments) {
      await db.execute(
        `INSERT INTO departments (id, name, manager_id, budget, staff_count, location) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dept.id, dept.name, dept.manager_id, dept.budget, dept.staff_count, dept.location]
      );
    }

    // 3. Create MFA auth methods
    console.log('Creating authentication methods...');
    const authMethods = [
      { id: uuidv4(), user_id: userIds[0], method_type: 'totp', method_value: 'JBSWY3DPEHPK3PXP', is_primary: 1, verified_at: new Date().toISOString(), last_used_at: new Date().toISOString() },
      { id: uuidv4(), user_id: userIds[0], method_type: 'sms', method_value: '+1-555-0123', is_primary: 0, verified_at: new Date().toISOString(), last_used_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: uuidv4(), user_id: userIds[1] || userIds[0], method_type: 'email', method_value: 'dr.smith@clinic.com', is_primary: 1, verified_at: new Date().toISOString(), last_used_at: new Date().toISOString() },
      { id: uuidv4(), user_id: userIds[2] || userIds[0], method_type: 'totp', method_value: 'KBSWY3DPEHPK3PXQ', is_primary: 1, verified_at: new Date().toISOString(), last_used_at: new Date(Date.now() - 3600000).toISOString() },
      { id: uuidv4(), user_id: userIds[3] || userIds[0], method_type: 'biometric', method_value: 'fingerprint', is_primary: 1, verified_at: new Date().toISOString(), last_used_at: new Date().toISOString() },
    ];

    for (const method of authMethods) {
      await db.execute(
        `INSERT INTO auth_methods (id, user_id, method_type, method_value, is_primary, verified_at, last_used_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [method.id, method.user_id, method.method_type, method.method_value, method.is_primary, method.verified_at, method.last_used_at]
      );
    }

    // 4. Create audit logs
    console.log('Creating audit logs...');
    const auditLogs = [
      { id: uuidv4(), user_id: userIds[0], action: 'LOGIN', resource_type: 'auth', resource_id: null, ip_address: '192.168.1.100', user_agent: 'Mozilla/5.0', status: 'success', severity: 'low', details: '{"method":"password"}', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: uuidv4(), user_id: userIds[1] || userIds[0], action: 'UPDATE', resource_type: 'patient', resource_id: 'patient-123', ip_address: '192.168.1.105', user_agent: 'Mozilla/5.0', status: 'success', severity: 'medium', details: '{"fields":["diagnosis"]}', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
      { id: uuidv4(), user_id: userIds[2] || userIds[0], action: 'ACCESS', resource_type: 'medical_record', resource_id: 'record-456', ip_address: '192.168.1.110', user_agent: 'Mozilla/5.0', status: 'success', severity: 'medium', details: '{"accessed_fields":["history","medications"]}', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
      { id: uuidv4(), user_id: userIds[3] || userIds[0], action: 'DELETE', resource_type: 'patient', resource_id: 'patient-789', ip_address: '192.168.1.115', user_agent: 'Mozilla/5.0', status: 'failure', severity: 'high', details: '{"error":"insufficient_permissions"}', timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
      { id: uuidv4(), user_id: userIds[0], action: 'EXPORT', resource_type: 'report', resource_id: 'report-abc', ip_address: '192.168.1.100', user_agent: 'Mozilla/5.0', status: 'success', severity: 'high', details: '{"format":"csv","rows":5000}', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: uuidv4(), user_id: userIds[4] || userIds[0], action: 'LOGIN', resource_type: 'auth', resource_id: null, ip_address: '10.0.0.50', user_agent: 'Mozilla/5.0', status: 'failure', severity: 'critical', details: '{"reason":"invalid_credentials","attempts":3}', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: uuidv4(), user_id: userIds[1] || userIds[0], action: 'CREATE', resource_type: 'prescription', resource_id: 'rx-001', ip_address: '192.168.1.105', user_agent: 'Mozilla/5.0', status: 'success', severity: 'medium', details: '{"medication":"Lisinopril","dosage":"10mg"}', timestamp: new Date(Date.now() - 3600000 * 16).toISOString() },
      { id: uuidv4(), user_id: userIds[2] || userIds[0], action: 'UPDATE', resource_type: 'security_settings', resource_id: 'policy-001', ip_address: '192.168.1.110', user_agent: 'Mozilla/5.0', status: 'success', severity: 'high', details: '{"changed":"password_policy"}', timestamp: new Date(Date.now() - 3600000 * 20).toISOString() },
      { id: uuidv4(), user_id: userIds[5] || userIds[0], action: 'ACCESS', resource_type: 'medical_record', resource_id: 'record-999', ip_address: '192.168.1.120', user_agent: 'Mozilla/5.0', status: 'failure', severity: 'critical', details: '{"error":"access_denied","reason":"insufficient_clearance"}', timestamp: new Date(Date.now() - 3600000 * 30).toISOString() },
      { id: uuidv4(), user_id: userIds[0], action: 'BACKUP', resource_type: 'database', resource_id: 'db-main', ip_address: '192.168.1.100', user_agent: 'System', status: 'success', severity: 'low', details: '{"size":"2.4GB","duration":"15min"}', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
    ];

    for (const log of auditLogs) {
      await db.execute(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, user_agent, status, severity, details, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [log.id, log.user_id, log.action, log.resource_type, log.resource_id, log.ip_address, log.user_agent, log.status, log.severity, log.details, log.timestamp]
      );
    }

    // 5. Create encryption keys
    console.log('Creating encryption keys...');
    const encryptionKeys = [
      { id: uuidv4(), name: 'Patient Data Encryption Key', algorithm: 'AES-256-GCM', key_size: 256, purpose: 'patient_data', status: 'active', key_hash: 'a1b2c3d4e5f6...', rotation_schedule: 90, last_rotated: new Date(Date.now() - 86400000 * 45).toISOString(), expires_at: new Date(Date.now() + 86400000 * 45).toISOString() },
      { id: uuidv4(), name: 'Database Encryption Key', algorithm: 'AES-256-GCM', key_size: 256, purpose: 'database', status: 'active', key_hash: 'b2c3d4e5f6g7...', rotation_schedule: 180, last_rotated: new Date(Date.now() - 86400000 * 90).toISOString(), expires_at: new Date(Date.now() + 86400000 * 90).toISOString() },
      { id: uuidv4(), name: 'Backup Encryption Key', algorithm: 'RSA-4096', key_size: 4096, purpose: 'backup', status: 'active', key_hash: 'c3d4e5f6g7h8...', rotation_schedule: 365, last_rotated: new Date(Date.now() - 86400000 * 180).toISOString(), expires_at: new Date(Date.now() + 86400000 * 185).toISOString() },
      { id: uuidv4(), name: 'Communication Encryption Key', algorithm: 'AES-256-GCM', key_size: 256, purpose: 'communication', status: 'active', key_hash: 'd4e5f6g7h8i9...', rotation_schedule: 60, last_rotated: new Date(Date.now() - 86400000 * 30).toISOString(), expires_at: new Date(Date.now() + 86400000 * 30).toISOString() },
      { id: uuidv4(), name: 'Legacy System Key', algorithm: 'AES-128-CBC', key_size: 128, purpose: 'legacy', status: 'deprecated', key_hash: 'e5f6g7h8i9j0...', rotation_schedule: 0, last_rotated: new Date(Date.now() - 86400000 * 365).toISOString(), expires_at: new Date(Date.now() + 86400000 * 30).toISOString() },
    ];

    for (const key of encryptionKeys) {
      await db.execute(
        `INSERT INTO encryption_keys (id, name, algorithm, key_size, purpose, status, key_hash, rotation_schedule, last_rotated, expires_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [key.id, key.name, key.algorithm, key.key_size, key.purpose, key.status, key.key_hash, key.rotation_schedule, key.last_rotated, key.expires_at]
      );
    }

    // 6. Create consent records (get patient IDs)
    console.log('Creating consent records...');
    const patients = await db.query('SELECT id FROM patients LIMIT 5');
    const patientIds = patients.map((p: any) => p.id);

    if (patientIds.length > 0) {
      const consents = [
        { id: uuidv4(), patient_id: patientIds[0], consent_type: 'data_sharing', purpose: 'Treatment and care coordination', granted_by: userIds[0], granted_at: new Date(Date.now() - 86400000 * 30).toISOString(), expires_at: new Date(Date.now() + 86400000 * 335).toISOString(), status: 'active', scope: '{"categories":["medical_history","medications","lab_results"]}' },
        { id: uuidv4(), patient_id: patientIds[1] || patientIds[0], consent_type: 'marketing', purpose: 'Health and wellness communications', granted_by: userIds[1] || userIds[0], granted_at: new Date(Date.now() - 86400000 * 60).toISOString(), expires_at: new Date(Date.now() + 86400000 * 305).toISOString(), status: 'active', scope: '{"channels":["email","sms"]}' },
        { id: uuidv4(), patient_id: patientIds[2] || patientIds[0], consent_type: 'third_party', purpose: 'Insurance claim processing', granted_by: userIds[0], granted_at: new Date(Date.now() - 86400000 * 15).toISOString(), expires_at: new Date(Date.now() + 86400000 * 350).toISOString(), status: 'active', scope: '{"partners":["insurance_provider_A"]}' },
        { id: uuidv4(), patient_id: patientIds[3] || patientIds[0], consent_type: 'research', purpose: 'Clinical research participation', granted_by: userIds[2] || userIds[0], granted_at: new Date(Date.now() - 86400000 * 90).toISOString(), expires_at: new Date(Date.now() + 86400000 * 275).toISOString(), status: 'active', scope: '{"studies":["diabetes_study_2024"]}' },
        { id: uuidv4(), patient_id: patientIds[4] || patientIds[0], consent_type: 'data_sharing', purpose: 'Emergency care access', granted_by: userIds[1] || userIds[0], granted_at: new Date(Date.now() - 86400000 * 180).toISOString(), expires_at: null, status: 'active', scope: '{"categories":["all"]}' },
      ];

      for (const consent of consents) {
        await db.execute(
          `INSERT INTO consent_records (id, patient_id, consent_type, purpose, granted_by, granted_at, expires_at, status, scope) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [consent.id, consent.patient_id, consent.consent_type, consent.purpose, consent.granted_by, consent.granted_at, consent.expires_at, consent.status, consent.scope]
        );
      }
    }

    // 7. Create security policies
    console.log('Creating security policies...');
    const policies = [
      { id: uuidv4(), name: 'Password Policy', policy_type: 'password', rules: '{"min_length":12,"require_uppercase":true,"require_lowercase":true,"require_numbers":true,"require_special":true,"expiry_days":90,"prevent_reuse":5}', enabled: 1, enforcement_level: 'strict' },
      { id: uuidv4(), name: 'Session Timeout Policy', policy_type: 'session', rules: '{"timeout_minutes":30,"idle_timeout_minutes":15,"require_reauth":true}', enabled: 1, enforcement_level: 'strict' },
      { id: uuidv4(), name: 'IP Whitelist Policy', policy_type: 'network', rules: '{"allowed_ips":["192.168.1.0/24","10.0.0.0/8"],"block_unknown":false}', enabled: 1, enforcement_level: 'moderate' },
      { id: uuidv4(), name: 'Failed Login Attempts Policy', policy_type: 'authentication', rules: '{"max_attempts":5,"lockout_duration_minutes":30,"notify_admin":true}', enabled: 1, enforcement_level: 'strict' },
    ];

    for (const policy of policies) {
      await db.execute(
        `INSERT INTO security_policies (id, name, policy_type, rules, enabled, enforcement_level) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [policy.id, policy.name, policy.policy_type, policy.rules, policy.enabled, policy.enforcement_level]
      );
    }

    console.log('\n✅ Security data seeded successfully!');
    console.log('Summary:');
    console.log(`- User roles: ${userRoles.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Auth methods: ${authMethods.length}`);
    console.log(`- Audit logs: ${auditLogs.length}`);
    console.log(`- Encryption keys: ${encryptionKeys.length}`);
    console.log(`- Consent records: ${patientIds.length > 0 ? 5 : 0}`);
    console.log(`- Security policies: ${policies.length}`);
    
  } catch (error) {
    console.error('Security seeding failed:', error);
    throw error;
  }
}

async function run() {
  try {
    await seedSecurityDataOnly();
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

run();
