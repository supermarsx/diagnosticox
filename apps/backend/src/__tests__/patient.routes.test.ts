import express from 'express';
import request from 'supertest';
import { describe, it, beforeEach, vi, expect } from 'vitest';

// Mock auth middleware before importing routes so router uses our stubs
vi.mock('../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => { req.user = { userId: 'user-1', organizationId: 'org-1' }; next(); },
  enforceTenant: (req: any, _res: any, next: any) => { req.tenantId = 'org-1'; next(); },
  authorize: () => (_req: any, _res: any, next: any) => next(),
}));

import patientRoutes from '../routes/patient.routes';
import { patientController } from '../controllers/patient.controller';

describe('Patient routes (integration - mocked auth)', () => {
  beforeEach(() => {
    // reset controller behavior
    (patientController as any).list = vi.fn(async (req: any, res: any) => res.json({ patients: [{ id: 'p1' }], total: 1 }));
  });

  it('GET /api/patients returns list (through router) for tenant', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/patients', patientRoutes);

    const resp = await request(app).get('/api/patients');
    expect(resp.status).toBe(200);
    expect(resp.body).toHaveProperty('patients');
    expect(Array.isArray(resp.body.patients)).toBe(true);
    expect(resp.body.total).toBe(1);
  });
});
