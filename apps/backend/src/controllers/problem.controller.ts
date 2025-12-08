import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProblemController {
  private db = getDatabase();

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const { organizationId } = req.user!;

      const problems = await this.db.query(
        `SELECT * FROM problems 
         WHERE patient_id = ? AND organization_id = ? 
         ORDER BY priority DESC, created_at DESC`,
        [patientId, organizationId]
      );

      res.json(problems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async get(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const problem = await this.db.get(
        'SELECT * FROM problems WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

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

      res.json({ ...problem, hypotheses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
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
          encounter_id,
          problem_name,
          problem_type || 'symptom',
          onset_date,
          clinical_context,
          userId,
          now,
          now,
        ]
      );

      const problem = await this.db.get('SELECT * FROM problems WHERE id = ?', [id]);

      res.status(201).json(problem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user!;

      const existing = await this.db.get(
        'SELECT id FROM problems WHERE id = ? AND organization_id = ?',
        [id, organizationId]
      );

      if (!existing) {
        return res.status(404).json({ error: 'Problem not found' });
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

      res.json(problem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const problemController = new ProblemController();
