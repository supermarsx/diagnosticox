import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { writeAuditLog } from '../utils/audit';
import { generateEtag } from '../utils/etag';

export class PatientController {
  private db = getDatabase();

  async list(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { search, limit = '50', offset = '0' } = req.query;

      let query = 'SELECT * FROM patients WHERE organization_id = ?';
      const params: any[] = [organizationId];

      if (search) {
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR mrn LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit as string), parseInt(offset as string));

      const patients = await this.db.query(query, params);

      res.json({ patients, total: patients.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async get(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const patient = await this.db.get(
        'SELECT * FROM patients WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.setHeader('ETag', generateEtag(patient));
      res.setHeader('Cache-Control', 'no-store');
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const {
        mrn,
        first_name,
        last_name,
        date_of_birth,
        gender,
        contact_phone,
        contact_email,
        emergency_contact,
        insurance_info,
      } = req.body;

      if (!first_name || !last_name || !date_of_birth) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO patients (
          id, organization_id, mrn, first_name, last_name, date_of_birth,
          gender, contact_phone, contact_email, emergency_contact, insurance_info,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          organizationId,
          mrn,
          first_name,
          last_name,
          date_of_birth,
          gender,
          contact_phone,
          contact_email,
          JSON.stringify(emergency_contact || {}),
          JSON.stringify(insurance_info || {}),
          now,
          now,
        ]
      );

      const patient = await this.db.get('SELECT * FROM patients WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        patientId: id,
        table: 'patients',
        recordId: id,
        action: 'create',
        changes: { mrn, first_name, last_name, date_of_birth },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.setHeader('ETag', generateEtag(patient));
      res.setHeader('Cache-Control', 'no-store');
      res.status(201).json(patient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const existing = await this.db.get(
        'SELECT * FROM patients WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!existing) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Require If-Match to prevent lost updates when multiple clients edit the same record.
      const ifMatch = (req.headers['if-match'] as string | undefined)?.trim();
      const currentEtag = generateEtag(existing);
      if (!ifMatch) {
        return res.status(428).json({ error: 'Missing If-Match header for concurrency control' });
      }
      if (ifMatch !== currentEtag) {
        return res.status(412).json({ error: 'Precondition failed: resource has changed' });
      }

      const updates = req.body;
      const allowedFields = [
        'mrn',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'contact_phone',
        'contact_email',
        'emergency_contact',
        'insurance_info',
        'primary_provider_id',
      ];

      const fields: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          if (key === 'emergency_contact' || key === 'insurance_info') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await this.db.execute(
        `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      const patient = await this.db.get('SELECT * FROM patients WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        patientId: id,
        table: 'patients',
        recordId: id,
        action: 'update',
        changes: updates,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.setHeader('ETag', generateEtag(patient));
      res.setHeader('Cache-Control', 'no-store');
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const existing = await this.db.get(
        'SELECT id FROM patients WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!existing) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      await this.db.execute('DELETE FROM patients WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        patientId: id,
        table: 'patients',
        recordId: id,
        action: 'delete',
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.json({ message: 'Patient deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const patientController = new PatientController();
