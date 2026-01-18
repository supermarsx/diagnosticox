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

  async deidentifiedExport(req: AuthRequest, res: Response) {
    /**
     * One-click de-identified packet with configurable redaction.
     */
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      const { redact_mrn = 'true', redact_contact = 'true', redact_names = 'true' } = req.body;

      await ensurePatientAccessible(patientId, organizationId);

      const patient = await this.db.get(
        'SELECT * FROM patients WHERE id = ? AND organization_id = ?',
        [patientId, organizationId]
      );
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      // De-identify patient record
      const deidentifiedPatient = { ...patient };
      if (redact_mrn === 'true') deidentifiedPatient.mrn = 'REDACTED';
      if (redact_contact === 'true') {
        deidentifiedPatient.contact_phone = 'REDACTED';
        deidentifiedPatient.contact_email = 'REDACTED';
        deidentifiedPatient.emergency_contact = '{}';
      }
      if (redact_names === 'true') {
        deidentifiedPatient.first_name = 'PARTICIPANT';
        deidentifiedPatient.last_name = patientId.substring(0, 8);
      }

      const problems = await this.db.query(
        'SELECT id, problem_name, problem_type, onset_date, status, clinical_context FROM problems WHERE patient_id = ? AND organization_id = ?',
        [patientId, organizationId]
      );
      
      const facts = await this.db.query(
        'SELECT id, fact_type, measurement_name, measurement_value, measurement_unit, value_text, measured_at, source FROM facts WHERE patient_id = ? AND organization_id = ?',
        [patientId, organizationId]
      );

      const trials = await this.db.query(
        'SELECT id, trial_name, intervention, start_date, status, decision_outcome, clinical_notes FROM treatment_trials WHERE patient_id = ? AND organization_id = ?',
        [patientId, organizationId]
      );

      const packet = {
        export_date: new Date().toISOString(),
        organization_context: organizationId,
        patient: deidentifiedPatient,
        problems,
        facts,
        trials,
        disclaimer: 'This data has been de-identified for research/export purposes.'
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="deidentified_${patientId}.json"`);
      res.json(packet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const exportController = new ExportController();
