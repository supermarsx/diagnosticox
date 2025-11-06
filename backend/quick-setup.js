const { getDatabase } = require('./dist/config/database');
const { v4: uuidv4 } = require('uuid');

// Demo password hash for "demo123"
const DEMO_PASSWORD_HASH = '$2a$10$T.ShPYcVe6t52kUDF.8rHOIAhlTruvbrxjA2YnyYMAKL5nLHAwI.C';

async function quickSetup() {
  const db = getDatabase();
  
  const orgId = uuidv4();
  const userId = uuidv4();
  const patientId = uuidv4();
  
  console.log('Creating organization...');
  await db.execute(
    'INSERT INTO organizations (id, name, subdomain, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [orgId, 'Test Clinic', 'test-clinic', new Date().toISOString(), new Date().toISOString()]
  );
  
  console.log('Creating user...');
  await db.execute(
    'INSERT INTO users (id, organization_id, email, password_hash, full_name, role, specialty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, orgId, 'dr.smith@clinic.com', DEMO_PASSWORD_HASH, 'Dr. Jane Smith', 'clinician', 'Internal Medicine', new Date().toISOString(), new Date().toISOString()]
  );
  
  console.log('Creating patient...');
  await db.execute(
    'INSERT INTO patients (id, organization_id, mrn, first_name, last_name, date_of_birth, gender, contact_phone, contact_email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [patientId, orgId, 'MRN001', 'John', 'Doe', '1975-03-15', 'Male', '555-0101', 'john.doe@email.com', new Date().toISOString(), new Date().toISOString()]
  );
  
  console.log('✅ Quick setup completed!');
  process.exit(0);
}

quickSetup().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
