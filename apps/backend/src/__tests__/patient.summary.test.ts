import { describe, it, vi, expect } from 'vitest';
import { patientController } from '../controllers/patient.controller';

describe('PatientController.summary', () => {
  it('returns aggregated summary fields', async () => {
    const rows = [
      { id: 'patient-1', first_name: 'John', last_name: 'Doe', problem_count: 2, facts_count: 3, last_activity: '2025-10-02T00:00:00Z' },
      { id: 'patient-2', first_name: 'Sarah', last_name: 'Johnson', problem_count: 0, facts_count: 1, last_activity: null },
    ];

    (patientController as any).db = { query: vi.fn().mockResolvedValue(rows) } as any;

    const req: any = { tenantId: 'org-1', query: {} };
    const res: any = { json: vi.fn(), status: vi.fn(() => res) };

    await patientController.summary(req, res);

    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.patients.length).toBe(2);
    expect(payload.patients[0].problem_count).toBe(2);
    expect(payload.patients[0].last_activity).toBe('2025-10-02T00:00:00Z');
  });
});
