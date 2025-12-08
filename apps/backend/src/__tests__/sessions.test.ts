import request from 'supertest';
import app from '../index';
import { refreshTokenService } from '../services/refreshToken.service';

describe('Session listing & admin endpoints', () => {
  test('admin can list sessions for a user, non-admin cannot', async () => {
    // bootstrap admin
    const admin = await request(app).post('/api/auth/bootstrap').send({ org_name: 'sessions-org', admin_email: 'a@org.com', admin_password: 'pass', admin_full_name: 'Admin' }).expect(201);
    const adminToken = admin.body.token;

    // register another user under org
    const orgId = admin.body.organizationId;
    const userRes = await request(app).post('/api/auth/register').send({ email: 'bob@org.com', password: 'demo123', full_name: 'Bob', organization_id: orgId }).expect(201);
    const userToken = userRes.body.token;
    const sessionId = userRes.body.sessionId;

    // admin lists sessions for that user
    const list = await request(app).get(`/api/auth/sessions?userId=${userRes.body.user.id}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(Array.isArray(list.body.sessions)).toBeTruthy();

    // non-admin cannot list other user's sessions
    await request(app).get(`/api/auth/sessions?userId=${admin.body.user.id}`).set('Authorization', `Bearer ${userToken}`).expect(403);
  });
});
