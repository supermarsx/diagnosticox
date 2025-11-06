"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
async function seedSecurityDataMinimal() {
    const db = (0, database_1.getDatabase)();
    console.log('Seeding minimal security data...');
    try {
        // Get existing users with emails
        const users = await db.query('SELECT id, email, organization_id FROM users LIMIT 10');
        if (users.length === 0) {
            console.error('No users found. Please run main seed first.');
            process.exit(1);
        }
        const user = users[0];
        const userIds = users.map((u) => u.id);
        const userEmails = users.map((u) => u.email);
        const organizationId = user.organization_id;
        // Clear existing data
        console.log('Clearing existing security data...');
        await db.execute('DELETE FROM user_roles WHERE id IS NOT NULL');
        await db.execute('DELETE FROM departments WHERE id IS NOT NULL');
        await db.execute('DELETE FROM auth_methods WHERE id IS NOT NULL');
        await db.execute('DELETE FROM audit_logs WHERE id IS NOT NULL');
        await db.execute('DELETE FROM encryption_keys WHERE id IS NOT NULL');
        await db.execute('DELETE FROM consent_records WHERE id IS NOT NULL');
        // 1. Assign roles (user_roles table needs id)
        console.log('Assigning roles...');
        for (let i = 0; i < Math.min(8, userIds.length); i++) {
            await db.execute('INSERT INTO user_roles (id, user_id, role_id) VALUES (?, ?, ?)', [(0, uuid_1.v4)(), userIds[i], String(i + 1)]);
        }
        // 2. Create departments
        console.log('Creating departments...');
        const depts = [
            ['Emergency Medicine', 3500000, 42, 'Building A, Floor 1'],
            ['Internal Medicine', 2800000, 35, 'Building B, Floor 2'],
            ['Cardiology', 3200000, 28, 'Building B, Floor 3'],
        ];
        for (const [name, budget, count, location] of depts) {
            await db.execute('INSERT INTO departments (id, organization_id, name, manager_id, budget, user_count, location) VALUES (?, ?, ?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), organizationId, name, userIds[0], budget, count, location]);
        }
        // 3. Create auth methods
        console.log('Creating auth methods...');
        const authMethods = [
            ['totp', 'JBSWY3DPEHPK3PXP', 1, 1, '{"device":"Phone"}'],
            ['sms', '+1-555-0123', 1, 1, '{"carrier":"AT&T"}'],
            ['email', userEmails[0], 1, 1, '{}'],
        ];
        for (const [type, identifier, enabled, verified, metadata] of authMethods) {
            await db.execute('INSERT INTO auth_methods (id, user_id, method_type, identifier, enabled, verified, last_used, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), userIds[0], type, identifier, enabled, verified, new Date().toISOString(), metadata]);
        }
        // 4. Create audit logs (using existing schema from migration 001)
        console.log('Creating audit logs...');
        const auditLogs = [
            ['LOGIN', 'users', null, '{"method":"password"}', '192.168.1.100'],
            ['UPDATE', 'patients', 'patient-123', '{"fields":["diagnosis"]}', '192.168.1.105'],
            ['SELECT', 'patients', 'record-456', '{"fields":["history"]}', '192.168.1.110'],
            ['DELETE', 'patients', 'patient-789', '{"error":"insufficient_permissions"}', '192.168.1.115'],
            ['EXPORT', 'reports', 'report-abc', '{"format":"csv","rows":5000}', '192.168.1.100'],
            ['LOGIN', 'users', null, '{"reason":"invalid_credentials"}', '10.0.0.50'],
        ];
        for (const [action, table_name, record_id, changes, ip] of auditLogs) {
            await db.execute('INSERT INTO audit_logs (id, organization_id, user_id, action, table_name, record_id, changes, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), organizationId, userIds[0], action, table_name, record_id, changes, ip]);
        }
        // 5. Create encryption keys
        console.log('Creating encryption keys...');
        const keys = [
            ['Patient Data Encryption Key', 'AES-256-GCM', 256, 'patient_data', 'active', 45, 45],
            ['Database Encryption Key', 'AES-256-GCM', 256, 'database', 'active', 90, 90],
            ['Backup Encryption Key', 'RSA-4096', 4096, 'backup', 'active', 180, 185],
            ['Communication Encryption Key', 'AES-256-GCM', 256, 'communication', 'active', 30, 30],
            ['Legacy System Key', 'AES-128-CBC', 128, 'legacy', 'deprecated', 365, 30],
        ];
        for (const [name, algo, size, purpose, status, rotDays, expDays] of keys) {
            const rotDaysNum = Number(rotDays);
            const expDaysNum = Number(expDays);
            await db.execute('INSERT INTO encryption_keys (id, name, algorithm, key_size, purpose, status, last_rotation, expiry_date, usage_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                (0, uuid_1.v4)(), name, algo, size, purpose, status,
                new Date(Date.now() - rotDaysNum * 86400000).toISOString(),
                new Date(Date.now() + expDaysNum * 86400000).toISOString(),
                0
            ]);
        }
        // 6. Create consent records
        console.log('Creating consent records...');
        const patients = await db.query('SELECT id, first_name, last_name FROM patients LIMIT 5');
        if (patients.length > 0) {
            const consents = [
                ['data_sharing', 'granted', 30, 335, '["medical_history","medications","lab_results"]'],
                ['marketing', 'granted', 60, 305, '["email","sms"]'],
                ['third_party', 'granted', 15, 350, '["insurance"]'],
                ['research', 'granted', 90, 275, '["studies"]'],
            ];
            for (let i = 0; i < Math.min(consents.length, patients.length); i++) {
                const patient = patients[i];
                const [type, status, grantedDays, expiryDays, scope] = consents[i];
                const grantedDaysNum = Number(grantedDays);
                const expiryDaysNum = Number(expiryDays);
                await db.execute('INSERT INTO consent_records (id, patient_id, patient_name, consent_type, status, granted_date, expiry_date, scope) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
                    (0, uuid_1.v4)(), patient.id, `${patient.first_name} ${patient.last_name}`,
                    type, status,
                    new Date(Date.now() - grantedDaysNum * 86400000).toISOString(),
                    new Date(Date.now() + expiryDaysNum * 86400000).toISOString(),
                    scope
                ]);
            }
        }
        console.log('\n✅ Security data seeded successfully!');
    }
    catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
}
async function run() {
    try {
        await seedSecurityDataMinimal();
        process.exit(0);
    }
    catch (error) {
        console.error('Failed:', error);
        process.exit(1);
    }
}
run();
