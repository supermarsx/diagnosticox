/**
 * Database-backed integration tests. These tests assume the server is using
 * PostgreSQL (or compatible) and the migrations have been applied. In CI the
 * integration job brings up Postgres using docker-compose and test:ci runs
 * migrations before executing tests.
 */
import request from 'supertest';
import app from '../index';

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
});
