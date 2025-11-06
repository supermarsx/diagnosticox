"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const _002_security_data_1 = require("./002_security_data");
// For demo: use a pre-computed bcryptjs hash of 'demo123'
// Generated with: bcryptjs.hashSync('demo123', 10)
const DEMO_PASSWORD_HASH = '$2a$10$T.ShPYcVe6t52kUDF.8rHOIAhlTruvbrxjA2YnyYMAKL5nLHAwI.C';
async function seed() {
    const db = (0, database_1.getDatabase)();
    console.log('Seeding database with sample medical data...');
    // Create organization
    const orgId = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO organizations (id, name, subdomain, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`, [orgId, 'General Medical Clinic', 'general-medical', new Date().toISOString(), new Date().toISOString()]);
    console.log('Organization created');
    // Create clinician user
    const userId = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO users (id, organization_id, email, password_hash, full_name, role, specialty, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        userId,
        orgId,
        'dr.smith@clinic.com',
        DEMO_PASSWORD_HASH,
        'Dr. Jane Smith',
        'clinician',
        'Internal Medicine',
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    console.log('Clinician user created (email: dr.smith@clinic.com, password: demo123)');
    // Create sample patients
    const patient1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO patients (
      id, organization_id, mrn, first_name, last_name, date_of_birth,
      gender, contact_phone, contact_email, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        patient1Id,
        orgId,
        'MRN001',
        'John',
        'Doe',
        '1975-03-15',
        'Male',
        '555-0101',
        'john.doe@email.com',
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    const patient2Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO patients (
      id, organization_id, mrn, first_name, last_name, date_of_birth,
      gender, contact_phone, contact_email, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        patient2Id,
        orgId,
        'MRN002',
        'Sarah',
        'Johnson',
        '1982-07-22',
        'Female',
        '555-0102',
        'sarah.j@email.com',
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    console.log('Sample patients created');
    // Create problem for patient 1
    const problem1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO problems (
      id, patient_id, organization_id, problem_name, problem_type,
      onset_date, status, priority, clinical_context, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        problem1Id,
        patient1Id,
        orgId,
        'Chronic fatigue and weakness',
        'symptom',
        '2025-09-01',
        'active',
        1,
        'Patient reports progressive fatigue over 3 months, associated with weight loss of 10 lbs',
        userId,
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    // Create hypotheses for problem 1
    const hyp1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO hypotheses (
      id, problem_id, organization_id, diagnosis_name, diagnosis_code,
      pretest_probability, current_probability, evidence_strength,
      clinical_reasoning, rank, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        hyp1Id,
        problem1Id,
        orgId,
        'Hypothyroidism',
        'E03.9',
        0.25,
        0.35,
        'moderate',
        'Common cause of fatigue in middle-aged adults. TSH pending.',
        1,
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    const hyp2Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO hypotheses (
      id, problem_id, organization_id, diagnosis_name, diagnosis_code,
      pretest_probability, current_probability, evidence_strength,
      clinical_reasoning, rank, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        hyp2Id,
        problem1Id,
        orgId,
        'Anemia',
        'D50.9',
        0.20,
        0.25,
        'moderate',
        'Weight loss and fatigue suggest possible iron deficiency. CBC pending.',
        2,
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    const hyp3Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO hypotheses (
      id, problem_id, organization_id, diagnosis_name, diagnosis_code,
      pretest_probability, current_probability, evidence_strength,
      clinical_reasoning, rank, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        hyp3Id,
        problem1Id,
        orgId,
        'Depression',
        'F32.9',
        0.15,
        0.15,
        'weak',
        'Fatigue can be presenting symptom. PHQ-9 score needed.',
        3,
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    console.log('Problem and hypotheses created for Patient 1');
    // Create sample pivots
    const pivot1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO pivots (
      id, organization_id, pivot_name, pivot_type, category,
      description, sensitivity, specificity, likelihood_ratio_positive,
      likelihood_ratio_negative, clinical_context, is_public, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        pivot1Id,
        orgId,
        'Elevated TSH',
        'lab_test',
        'Endocrine',
        'Thyroid stimulating hormone elevation indicates hypothyroidism',
        0.95,
        0.88,
        7.92,
        0.06,
        'Primary screening test for thyroid dysfunction',
        1,
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    const pivot2Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO pivots (
      id, organization_id, pivot_name, pivot_type, category,
      description, sensitivity, specificity, likelihood_ratio_positive,
      likelihood_ratio_negative, clinical_context, is_public, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        pivot2Id,
        orgId,
        'Low Hemoglobin',
        'lab_test',
        'Hematology',
        'Hemoglobin below normal range indicates anemia',
        0.92,
        0.85,
        6.13,
        0.09,
        'Definitive test for anemia diagnosis',
        1,
        new Date().toISOString(),
        new Date().toISOString(),
    ]);
    console.log('Sample pivots created');
    // Create sample facts (vital signs)
    const fact1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO facts (
      id, patient_id, organization_id, problem_id, fact_type,
      measurement_name, measurement_value, measurement_unit,
      measured_at, source, recorded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        fact1Id,
        patient1Id,
        orgId,
        problem1Id,
        'vital_sign',
        'Blood Pressure',
        120,
        'mmHg',
        new Date().toISOString(),
        'clinical_exam',
        userId,
        new Date().toISOString(),
    ]);
    const fact2Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO facts (
      id, patient_id, organization_id, problem_id, fact_type,
      measurement_name, measurement_value, measurement_unit,
      measured_at, source, recorded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        fact2Id,
        patient1Id,
        orgId,
        problem1Id,
        'vital_sign',
        'Heart Rate',
        68,
        'bpm',
        new Date().toISOString(),
        'clinical_exam',
        userId,
        new Date().toISOString(),
    ]);
    console.log('Sample facts created');
    // Create timeline event
    const event1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO timeline_events (
      id, patient_id, organization_id, problem_id, event_type,
      event_date, event_name, description, clinical_significance,
      created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        event1Id,
        patient1Id,
        orgId,
        problem1Id,
        'step_change',
        '2025-09-01',
        'Symptom onset',
        'Patient noticed increased fatigue and decreased exercise tolerance',
        'Marks beginning of current illness',
        userId,
        new Date().toISOString(),
    ]);
    console.log('Timeline events created');
    // Create patient diary entries
    const diary1Id = (0, uuid_1.v4)();
    await db.execute(`INSERT INTO patient_diary (
      id, patient_id, organization_id, entry_date, entry_type,
      symptom_name, severity, notes, mood_rating, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        diary1Id,
        patient1Id,
        orgId,
        new Date().toISOString(),
        'symptom',
        'Fatigue',
        7,
        'Felt very tired after minimal activity',
        5,
        new Date().toISOString(),
    ]);
    console.log('Patient diary entries created');
    console.log('\n=== Seed Data Summary ===');
    console.log('Organization: General Medical Clinic');
    console.log('Clinician: dr.smith@clinic.com / demo123');
    console.log('Patients: 2 created (John Doe, Sarah Johnson)');
    console.log('Problems: 1 active problem with 3 differential diagnoses');
    console.log('Pivots: 2 diagnostic tests in library');
    console.log('========================\n');
}
async function run() {
    try {
        await seed();
        await (0, _002_security_data_1.seedSecurityData)((0, database_1.getDatabase)());
        console.log('Database seeded successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
run();
