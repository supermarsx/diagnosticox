import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

export class FactController {
  private db = getDatabase();

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      const { domain, start, end, limit = '100' } = req.query;

      await ensurePatientAccessible(patientId, organizationId);

      let sql = `
        SELECT * FROM facts
        WHERE patient_id = ? AND organization_id = ?
      `;
      const params: any[] = [patientId, organizationId];

      if (domain) {
        sql += ' AND fact_type = ?';
        params.push(domain);
      }

      if (start) {
        sql += ' AND measured_at >= ?';
        params.push(start);
      }
      if (end) {
        sql += ' AND measured_at <= ?';
        params.push(end);
      }

      sql += ' ORDER BY measured_at DESC LIMIT ?';
      params.push(parseInt(limit as string, 10));

      const facts = await this.db.query(sql, params);
      res.json({ facts });
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
        problem_id,
        fact_type,
        measurement_name,
        measurement_value,
        measurement_unit,
        value_text,
        measured_at,
        source,
        context,
      } = req.body;

      if (!patient_id || !fact_type || !measurement_name || !measured_at) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await ensurePatientAccessible(patient_id, organizationId);

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
          patient_id,
          organizationId,
          problem_id || null,
          fact_type,
          measurement_name,
          measurement_value ?? null,
          measurement_unit || null,
          value_text || null,
          measured_at,
          source || 'history',
          userId,
          JSON.stringify(context || {}),
          now,
        ]
      );

      const fact = await this.db.get('SELECT * FROM facts WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        patientId: patient_id,
        table: 'facts',
        recordId: id,
        action: 'create',
        changes: { fact_type, measurement_name, measured_at },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ fact });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const existing = await this.db.get(
        'SELECT patient_id FROM facts WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!existing) {
        return res.status(404).json({ error: 'Fact not found' });
      }

      const updates = req.body;
      const allowed = [
        'measurement_name',
        'measurement_value',
        'measurement_unit',
        'value_text',
        'measured_at',
        'source',
        'context',
      ];

      const fields: string[] = [];
      const values: any[] = [];
      for (const [key, val] of Object.entries(updates)) {
        if (allowed.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(key === 'context' ? JSON.stringify(val) : val);
        }
      }

      if (!fields.length) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      fields.push('created_at = created_at');
      values.push(id);

      await this.db.execute(`UPDATE facts SET ${fields.join(', ')} WHERE id = ?`, values);

      const fact = await this.db.get('SELECT * FROM facts WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        patientId: existing.patient_id,
        table: 'facts',
        recordId: id,
        action: 'update',
        changes: updates,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.json({ fact });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const existing = await this.db.get(
        'SELECT patient_id FROM facts WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!existing) {
        return res.status(404).json({ error: 'Fact not found' });
      }

      await this.db.execute('DELETE FROM facts WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        patientId: existing.patient_id,
        table: 'facts',
        recordId: id,
        action: 'delete',
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.json({ message: 'Fact deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const factController = new FactController();
