import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

function parseCsv(body: string): Array<Record<string, string>> {
  const lines = body.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] || '';
    });
    return row;
  });
}

export class ImportController {
  private db = getDatabase();

  /**
   * Import facts from CSV with headers:
   * patient_id,problem_id,fact_type,measurement_name,measurement_value,measurement_unit,value_text,measured_at,source
   */
  async importFacts(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const contentType = req.headers['content-type'] || '';

      if (!contentType.includes('text/csv')) {
        return res.status(400).json({ error: 'Content-Type text/csv required' });
      }

      const rows = parseCsv(req.body as string);
      if (!rows.length) {
        return res.status(400).json({ error: 'No rows parsed' });
      }

      const inserted: string[] = [];
      for (const row of rows) {
        const patientId = row.patient_id;
        if (!patientId) continue;
        await ensurePatientAccessible(patientId, organizationId);

        const id = uuidv4();
        const now = new Date().toISOString();
        await this.db.execute(
          `INSERT INTO facts (
            id, patient_id, organization_id, problem_id, fact_type,
            measurement_name, measurement_value, measurement_unit, value_text,
            measured_at, source, recorded_by, context, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            patientId,
            organizationId,
            row.problem_id || null,
            row.fact_type || 'history',
            row.measurement_name || 'Observation',
            row.measurement_value ? Number(row.measurement_value) : null,
            row.measurement_unit || null,
            row.value_text || null,
            row.measured_at || now,
            row.source || 'import',
            userId,
            JSON.stringify({}),
            now,
          ]
        );
        inserted.push(id);
      }

      await writeAuditLog({
        organizationId,
        userId,
        table: 'facts',
        action: 'create',
        recordId: inserted[0],
        changes: { imported: inserted.length },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ inserted: inserted.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const importController = new ImportController();
