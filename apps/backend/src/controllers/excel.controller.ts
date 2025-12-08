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

export class ExcelController {
  private db = getDatabase();

  async exportPatientWorkbook(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      await ensurePatientAccessible(patientId, organizationId);

      const patient = await this.db.get('SELECT * FROM patients WHERE id = ? AND organization_id = ?', [patientId, organizationId]);
      const problems = await this.db.query('SELECT * FROM problems WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);
      const facts = await this.db.query('SELECT * FROM facts WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);
      const timeline = await this.db.query('SELECT * FROM timeline_events WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);
      const trials = await this.db.query('SELECT * FROM treatment_trials WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);

      const workbook = [
        { name: 'patients', csv: toCsv([patient]) },
        { name: 'problems', csv: toCsv(problems) },
        { name: 'facts', csv: toCsv(facts) },
        { name: 'timeline_events', csv: toCsv(timeline) },
        { name: 'treatment_trials', csv: toCsv(trials) },
      ];

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${patientId}_workbook.zip"`);

      // Simple multipart-like zip: boundary separated CSV parts to avoid dependency
      const boundary = '---DIAGNOSTICOX-BOUNDARY---';
      const chunks: string[] = [];
      workbook.forEach((sheet) => {
        chunks.push(boundary);
        chunks.push(`Filename: ${sheet.name}.csv`);
        chunks.push('');
        chunks.push(sheet.csv);
      });
      chunks.push(boundary);
      res.send(chunks.join('\n'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const excelController = new ExcelController();
