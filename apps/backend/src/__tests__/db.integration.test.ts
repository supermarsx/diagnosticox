/**
 * Database-backed integration tests. These tests assume the server is using
 * PostgreSQL (or compatible) and the migrations have been applied. In CI the
 * integration job brings up Postgres using docker-compose and test:ci runs
 * migrations before executing tests.
 */
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import app from '../index';
import { refreshTokenService } from '../services/refreshToken.service';

describe('DB-backed integration', () => {
  test('bootstrap admin -> create patient -> fetch patient', async () => {
    // Bootstrap a new org+admin (fresh DB expected in CI)
    const bootstrapRes = await request(app)
      .post('/api/auth/bootstrap')
      .send({ org_name: 'test-org', admin_email: 'admin@example.com', admin_password: 'pass1234', admin_full_name: 'Admin User' })
      .expect(201);

    expect(bootstrapRes.body).toHaveProperty('organizationId');
    expect(bootstrapRes.body).toHaveProperty('user');
    expect(bootstrapRes.body).toHaveProperty('token');

    const token = bootstrapRes.body.token;
    const refreshToken = bootstrapRes.body.refreshToken;

    // verify refresh token persisted in DB
    const found = await refreshTokenService.findByToken(refreshToken);
    expect(found).not.toBeNull();

    // Revoke via API and re-check DB row is marked revoked
    await request(app).post('/api/auth/token/revoke').send({ refreshToken }).expect(200);
    const foundAfter = await refreshTokenService.findByToken(refreshToken);
    expect(foundAfter.revoked === 1 || foundAfter.revoked === true).toBeTruthy();

    // audit should have a revoke row
    const audit = await (await import('../config/database')).getDatabase().get('SELECT * FROM token_audit WHERE token = ? ORDER BY created_at DESC', [refreshToken]);
    expect(audit).not.toBeNull();
    expect(audit.event_type).toBe('revoke');

    // Create a patient
    const newPatient = {
      first_name: 'Alice',
      last_name: 'Patient',
      date_of_birth: '1988-01-01',
      mrn: 'MRN-1234'
    };

    const createRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(newPatient)
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    const patientId = createRes.body.id;

    // Fetch patient
    const getRes = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body).toHaveProperty('first_name', 'Alice');
    expect(getRes.body).toHaveProperty('mrn', 'MRN-1234');
  }, 20000);

  test('happy path: problem -> pivots -> bayesian -> trial -> metrics -> decision', async () => {
    // bootstrap admin
    const bootstrapRes = await request(app)
      .post('/api/auth/bootstrap')
      .send({ org_name: 'happy-org', admin_email: 'happy-admin@example.com', admin_password: 'pass123', admin_full_name: 'Happy Admin' })
      .expect(201);

    const token = bootstrapRes.body.token;
    const orgId = bootstrapRes.body.organizationId;

    // create patient
    const patient = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Happy', last_name: 'Patient', date_of_birth: '1990-01-01' })
      .expect(201);

    const patientId = patient.body.id;

    // create a problem
    const problemRes = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${token}`)
      .send({ patient_id: patientId, problem_name: 'Chronic cough' })
      .expect(201);

    const problemId = problemRes.body.id;

    // create two pivots (diagnostic tests) in pivot library
    const pivot1 = await request(app)
      .post('/api/pivots')
      .set('Authorization', `Bearer ${token}`)
      .send({ pivot_name: 'Chest X-Ray', pivot_type: 'test', category: 'imaging', likelihood_ratio_positive: 5, likelihood_ratio_negative: 0.3 })
      .expect(201);

    const pivot2 = await request(app)
      .post('/api/pivots')
      .set('Authorization', `Bearer ${token}`)
      .send({ pivot_name: 'Spirometry with bronchodilator', pivot_type: 'test', category: 'pulmonary', likelihood_ratio_positive: 3, likelihood_ratio_negative: 0.4 })
      .expect(201);

    // Bayesian recommendation: recommendTier for a given current_probability
    const recommend = await request(app)
      .post('/api/bayesian/recommend-tier')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_probability: 0.25 })
      .expect(200);

    expect(recommend.body).toHaveProperty('tier');

    // Create a trial for the problem
    const trialCreate = await request(app)
      .post('/api/trials')
      .set('Authorization', `Bearer ${token}`)
      .send({ patient_id: patientId, problem_id: problemId, trial_name: 'ICS Trial', intervention: 'Inhaled corticosteroid' })
      .expect(201);

    const trialId = trialCreate.body.id;

    // Add metric - baseline
    const metric1 = await request(app)
      .post(`/api/trials/${trialId}/metrics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ metric_name: 'Symptom NRS', metric_value: 8 })
      .expect(201);

    // Add follow-up metric showing improvement
    const metric2 = await request(app)
      .post(`/api/trials/${trialId}/metrics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ metric_name: 'Symptom NRS', metric_value: 3 })
      .expect(201);

    // Update trial to decision point reached
    const update = await request(app)
      .put(`/api/trials/${trialId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ decision_point_reached: 1, decision_outcome: 'successful', status: 'completed' })
      .expect(200);

    expect(update.body).toHaveProperty('status', 'completed');
    expect(update.body).toHaveProperty('decision_outcome', 'successful');
  }, 30000);
});
