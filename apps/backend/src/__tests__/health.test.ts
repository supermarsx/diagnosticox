import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('GET /health', () => {
  it('returns status ok and ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    // timestamp should be an ISO string
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
