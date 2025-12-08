import { describe, it, expect, vi, beforeEach } from 'vitest';
import { patientController } from '../controllers/patient.controller';

describe('PatientController.list', () => {
  beforeEach(() => {
    // reset any mocks
    (patientController as any).db = { query: vi.fn() } as any;
  });

  it('returns patients with problem_count aggregated', async () => {
    const patients = [
      { id: 'patient-1', first_name: 'John', last_name: 'Doe', organization_id: 'org-1', problem_count: 2 },
      { id: 'patient-2', first_name: 'Sarah', last_name: 'Johnson', organization_id: 'org-1', problem_count: 0 },
    ];

    (patientController as any).db.query.mockResolvedValue(patients);

    const req: any = { tenantId: 'org-1', query: {} };
    const res: any = { json: vi.fn(), status: vi.fn(() => res) };

    await patientController.list(req, res);

    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(Array.isArray(payload.patients)).toBe(true);
    expect(payload.patients[0].problem_count).toBe(2);
    expect(payload.total).toBe(2);
  });
});
