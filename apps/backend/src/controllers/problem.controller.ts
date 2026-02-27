import { Response } from 'express';
import type { ProblemBase } from '@diagnosticox/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';
import { generateEtag } from '../utils/etag';

export class ProblemController {
  private db = getDatabase();

  async list(req: AuthRequest, res: Response) {
    try {
      const patientId = (req.query.patientId as string | undefined)?.trim();
      if (!patientId) {
        return res.status(400).json({ error: 'patientId query parameter is required' });
      }

      const organizationId = req.tenantId || req.user!.organizationId;
      await ensurePatientAccessible(patientId, organizationId);

      const problems = (await this.db.query(
        `SELECT * FROM problems
         WHERE patient_id = ? AND organization_id = ?
         ORDER BY priority DESC, created_at DESC`,
        [patientId, organizationId]
      )) as ProblemBase[];

      res.json({ problems });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      await ensurePatientAccessible(patientId, organizationId);

      const problems = (await this.db.query(
        `SELECT * FROM problems 
         WHERE patient_id = ? AND organization_id = ? 
         ORDER BY priority DESC, created_at DESC`,
        [patientId, organizationId]
      )) as ProblemBase[];

      res.json(problems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async get(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const problem = (await this.db.get(
        'SELECT * FROM problems WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      )) as ProblemBase | undefined;

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Get associated hypotheses
      const hypotheses = await this.db.query(
        `SELECT * FROM hypotheses 
         WHERE problem_id = ? 
         ORDER BY rank ASC, current_probability DESC`,
        [id]
      );

      const payload = { ...(problem as ProblemBase), hypotheses };
      res.setHeader('ETag', generateEtag(problem));
      res.setHeader('Cache-Control', 'no-store');
      res.json(payload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listHypotheses(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const problem = await this.db.get(
        'SELECT id FROM problems WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const hypotheses = await this.db.query(
        `SELECT * FROM hypotheses
         WHERE problem_id = ? AND organization_id = ?
         ORDER BY rank ASC, current_probability DESC`,
        [id, organizationId]
      );

      res.json({ hypotheses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createHypothesis(req: AuthRequest, res: Response) {
    try {
      const { id: problemId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      const {
        diagnosis_code,
        diagnosis_name,
        pretest_probability,
        current_probability,
        evidence_strength,
        clinical_reasoning,
        supporting_facts,
        refuting_facts,
        rank,
      } = req.body;

      if (!diagnosis_name || pretest_probability === undefined || current_probability === undefined) {
        return res.status(400).json({ error: 'Missing required hypothesis fields' });
      }

      const problem = await this.db.get(
        'SELECT id, patient_id FROM problems WHERE id = ? AND organization_id = ?',
        [problemId, organizationId]
      );
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const hypothesisId = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO hypotheses (
          id, problem_id, organization_id, diagnosis_code, diagnosis_name,
          pretest_probability, current_probability, evidence_strength,
          clinical_reasoning, supporting_facts, refuting_facts, rank, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hypothesisId,
          problemId,
          organizationId,
          diagnosis_code || null,
          diagnosis_name,
          Number(pretest_probability),
          Number(current_probability),
          evidence_strength || 'moderate',
          clinical_reasoning || null,
          JSON.stringify(supporting_facts || []),
          JSON.stringify(refuting_facts || []),
          rank ?? 0,
          'active',
          now,
          now,
        ]
      );

      const hypothesis = await this.db.get('SELECT * FROM hypotheses WHERE id = ?', [hypothesisId]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        patientId: problem.patient_id,
        table: 'hypotheses',
        recordId: hypothesisId,
        action: 'create',
        changes: { diagnosis_name, pretest_probability, current_probability },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ hypothesis });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateHypothesis(req: AuthRequest, res: Response) {
    try {
      const { hypothesisId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const existing = await this.db.get(
        'SELECT id, problem_id FROM hypotheses WHERE id = ? AND organization_id = ?',
        [hypothesisId, organizationId]
      );
      if (!existing) {
        return res.status(404).json({ error: 'Hypothesis not found' });
      }

      const allowedFields = [
        'diagnosis_code',
        'diagnosis_name',
        'pretest_probability',
        'current_probability',
        'evidence_strength',
        'clinical_reasoning',
        'supporting_facts',
        'refuting_facts',
        'rank',
        'status',
      ];

      const fields: string[] = [];
      const values: any[] = [];
      for (const [key, value] of Object.entries(req.body || {})) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          if (key === 'supporting_facts' || key === 'refuting_facts') {
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
      values.push(hypothesisId);

      await this.db.execute(`UPDATE hypotheses SET ${fields.join(', ')} WHERE id = ?`, values);

      const hypothesis = await this.db.get('SELECT * FROM hypotheses WHERE id = ?', [hypothesisId]);
      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        table: 'hypotheses',
        recordId: hypothesisId,
        action: 'update',
        changes: req.body,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.json({ hypothesis });
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
        problem_name,
        problem_type,
        onset_date,
        clinical_context,
        encounter_id,
      } = req.body;

      if (!patient_id || !problem_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await ensurePatientAccessible(patient_id, organizationId);

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO problems (
          id, patient_id, organization_id, encounter_id, problem_name,
          problem_type, onset_date, clinical_context, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          patient_id,
          organizationId,
          encounter_id || null,
          problem_name,
          problem_type || 'symptom',
          onset_date || null,
          clinical_context || null,
          userId,
          now,
          now,
        ]
      );

      const problem = await this.db.get('SELECT * FROM problems WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        patientId: patient_id,
        table: 'problems',
        recordId: id,
        action: 'create',
        changes: { problem_name, problem_type },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.setHeader('ETag', generateEtag(problem));
      res.setHeader('Cache-Control', 'no-store');
      res.status(201).json(problem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const existing = await this.db.get(
        'SELECT id FROM problems WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!existing) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Concurrency guard
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
        'problem_name',
        'problem_type',
        'onset_date',
        'status',
        'priority',
        'clinical_context',
      ];

      const fields: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await this.db.execute(
        `UPDATE problems SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      const problem = await this.db.get('SELECT * FROM problems WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        table: 'problems',
        recordId: id,
        action: 'update',
        changes: updates,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.setHeader('ETag', generateEtag(problem));
      res.setHeader('Cache-Control', 'no-store');
      res.json(problem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async validateClosure(req: AuthRequest, res: Response) {
    /**
     * Enforce two-domain evidence check before closing a problem.
     * Checks if there are facts from at least 2 different domains/types.
     */
    try {
      const { id } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      // Count distinct fact types for this problem
      const result = await this.db.get(
        `SELECT COUNT(DISTINCT fact_type) as domain_count 
         FROM facts 
         WHERE problem_id = ? AND organization_id = ?`,
        [id, organizationId]
      );

      const domainCount = result?.domain_count || 0;
      const canClose = domainCount >= 2;

      res.json({
        problem_id: id,
        can_close: canClose,
        domain_count: domainCount,
        message: canClose 
          ? 'Evidence threshold met (2+ domains).' 
          : 'Insufficient evidence. Closing a problem requires evidence from at least 2 distinct domains (e.g. Lab + Clinical Sign).'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const problemController = new ProblemController();
