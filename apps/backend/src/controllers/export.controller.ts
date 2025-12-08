import { Response } from 'express';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';

function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: any) => {
    if (value === null || value === undefined) return '';
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape((row as any)[h])).join(','));
  });
  return lines.join('\n');
}

export class ExportController {
  private db = getDatabase();

  async patientBundle(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      const { format = 'json', type = 'facts' } = req.query;

      await ensurePatientAccessible(patientId, organizationId);

      const patient = await this.db.get(
        'SELECT * FROM patients WHERE id = ? AND organization_id = ?',
        [patientId, organizationId]
      );
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      const problems = await this.db.query(
        'SELECT * FROM problems WHERE patient_id = ? AND organization_id = ?',
        [patientId, organizationId]
      );
      const facts = await this.db.query(
        'SELECT * FROM facts WHERE patient_id = ? AND organization_id = ? ORDER BY measured_at DESC',
        [patientId, organizationId]
      );
      const timeline = await this.db.query(
        'SELECT * FROM timeline_events WHERE patient_id = ? AND organization_id = ? ORDER BY event_date DESC',
        [patientId, organizationId]
      );
      const trials = await this.db.query(
        'SELECT * FROM treatment_trials WHERE patient_id = ? AND organization_id = ? ORDER BY start_date DESC',
        [patientId, organizationId]
      );

      const bundle = { patient, problems, facts, timeline, trials };

      if (String(format).toLowerCase() === 'csv') {
        const which = String(type).toLowerCase();
        let payload = facts;
        let filename = `${patientId}_facts.csv`;
        if (which === 'problems') {
          payload = problems;
          filename = `${patientId}_problems.csv`;
        } else if (which === 'timeline') {
          payload = timeline;
          filename = `${patientId}_timeline.csv`;
        } else if (which === 'trials') {
          payload = trials;
          filename = `${patientId}_trials.csv`;
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(toCsv(payload));
      }

      res.json(bundle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const exportController = new ExportController();
