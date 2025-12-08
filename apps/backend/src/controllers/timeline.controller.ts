import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export class TimelineController {
  private db = getDatabase();

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const { organizationId } = req.user!;

      const events = await this.db.query(
        `SELECT * FROM timeline_events 
         WHERE patient_id = ? AND organization_id = ? 
         ORDER BY event_date DESC`,
        [patientId, organizationId]
      );

      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const {
        patient_id,
        problem_id,
        event_type,
        event_date,
        event_name,
        description,
        clinical_significance,
        related_facts,
      } = req.body;

      if (!patient_id || !event_type || !event_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO timeline_events (
          id, patient_id, organization_id, problem_id, event_type,
          event_date, event_name, description, clinical_significance,
          related_facts, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          patient_id,
          organizationId,
          problem_id,
          event_type,
          event_date || now,
          event_name,
          description,
          clinical_significance,
          JSON.stringify(related_facts || []),
          userId,
          now,
        ]
      );

      const event = await this.db.get('SELECT * FROM timeline_events WHERE id = ?', [id]);

      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const timelineController = new TimelineController();
