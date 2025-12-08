import request from 'supertest';
import app from '../index';

describe('Auth routes - basic validation', () => {
  test('POST /api/auth/register returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/login returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/token/refresh returns 400 for missing refresh token', async () => {
    const res = await request(app).post('/api/auth/token/refresh').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/token/revoke returns 400 for missing token/sessionId', async () => {
    const res = await request(app).post('/api/auth/token/revoke').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /api/auth/sessions without userId returns 400', async () => {
    const res = await request(app).get('/api/auth/sessions');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
