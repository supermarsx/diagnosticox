import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

export class PatientPivotController {
  private db = getDatabase();

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      await ensurePatientAccessible(patientId, organizationId);

      const pivots = await this.db.query(
        `SELECT pp.*, p.pivot_name, p.pivot_type, p.category 
         FROM patient_pivots pp
         JOIN pivots p ON pp.pivot_id = p.id
         WHERE pp.patient_id = ? AND pp.organization_id = ?
         ORDER BY pp.recorded_at DESC`,
        [patientId, organizationId]
      );

      res.json({ pivots });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const {
        patient_id,
        pivot_id,
        problem_id,
        measured_value,
        meets_threshold,
        note,
        recorded_at,
      } = req.body;

      if (!patient_id || !pivot_id) {
        return res.status(400).json({ error: 'patient_id and pivot_id are required' });
      }

      await ensurePatientAccessible(patient_id, organizationId);

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO patient_pivots (
          id, organization_id, patient_id, problem_id, pivot_id,
          measured_value, meets_threshold, note, recorded_by, recorded_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          organizationId,
          patient_id,
          problem_id || null,
          pivot_id,
          measured_value ?? null,
          meets_threshold ? 1 : 0,
          note || null,
          userId,
          recorded_at || now,
          now,
          now,
        ]
      );

      const pivot = await this.db.get('SELECT * FROM patient_pivots WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        patientId: patient_id,
        table: 'patient_pivots',
        recordId: id,
        action: 'create',
        changes: { pivot_id, measured_value, meets_threshold },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ pivot });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const patientPivotController = new PatientPivotController();
