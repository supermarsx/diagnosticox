import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { writeAuditLog } from '../utils/audit';
import { generateEtag } from '../utils/etag';

export class PatientController {
  private db = getDatabase();

  async list(req: AuthRequest, res: Response) {
    /**
     * List patients for the requesting tenant (organization).
     * Supports simple text search across first_name/last_name/mrn and pagination.
     */
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { search, limit = '50', offset = '0' } = req.query;

      // include problem_count via subquery to avoid N+1 requests
      let query = `SELECT p.*, (
        SELECT COUNT(*) FROM problems pr WHERE pr.patient_id = p.id AND pr.organization_id = ?
      ) AS problem_count
      FROM patients p WHERE p.organization_id = ?`;
      const params: any[] = [organizationId];

      if (search) {
        query += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.mrn LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      // note: params contains organizationId for subquery + organizationId for WHERE
      params.unshift(organizationId);
      params.push(parseInt(limit as string), parseInt(offset as string));

      const patients = await this.db.query(query, params);

      res.json({ patients, total: patients.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async summary(req: AuthRequest, res: Response) {
    /**
     * Return an aggregated patient summary per tenant.
     * Includes problem_count, facts_count, and last_activity timestamp (best-effort).
     */
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { limit = '50', offset = '0' } = req.query;

      const query = `
        SELECT p.id, p.first_name, p.last_name, p.mrn, p.date_of_birth, p.gender,
          (
            SELECT COUNT(*) FROM problems pr WHERE pr.patient_id = p.id AND pr.organization_id = ?
          ) AS problem_count,
          (
            SELECT COUNT(*) FROM facts f WHERE f.patient_id = p.id AND f.organization_id = ?
          ) AS facts_count,
          (
            SELECT MAX(coalesced) FROM (
              SELECT pr.updated_at AS coalesced FROM problems pr WHERE pr.patient_id = p.id AND pr.organization_id = ?
              UNION ALL
              SELECT f.measured_at AS coalesced FROM facts f WHERE f.patient_id = p.id AND f.organization_id = ?
              UNION ALL
              SELECT t.event_date AS coalesced FROM timeline_events t WHERE t.patient_id = p.id AND t.organization_id = ?
            ) AS combined
          ) AS last_activity
        FROM patients p
        WHERE p.organization_id = ?
        ORDER BY p.updated_at DESC
        LIMIT ? OFFSET ?
      `;

      const params = [organizationId, organizationId, organizationId, organizationId, organizationId, parseInt(limit as string), parseInt(offset as string)];

      const rows = await this.db.query(query, params);
      res.json({ patients: rows, total: rows.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req: AuthRequest, res: Response) {
    /**
     * Retrieve a single patient by id. Response includes ETag header (for
     * concurrency protection) and Cache-Control: no-store to prevent client
     * caching of a sensitive resource.
     */
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
    /**
     * Create a new patient scoped to the caller's tenant. This method will
     * set created/updated timestamps and write an audit log for traceability.
     */
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
    /**
     * Update an existing patient. Clients must send an If-Match header with the
     * current ETag value to protect against lost updates. The controller will
     * reject modifications if the ETag does not match (HTTP 412) or the header
     * is missing (HTTP 428).
     */
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
    /**
     * Delete a patient record. The operation is scoped to the tenant and writes
     * an audit log entry after successful deletion.
     */
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
