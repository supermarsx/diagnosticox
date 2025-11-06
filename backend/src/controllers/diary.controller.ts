import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export class DiaryController {
  private db = getDatabase();

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const { organizationId } = req.user!;
      const { start_date, end_date, entry_type } = req.query;

      let query = `SELECT * FROM patient_diary WHERE patient_id = ? AND organization_id = ?`;
      const params: any[] = [patientId, organizationId];

      if (start_date) {
        query += ' AND entry_date >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND entry_date <= ?';
        params.push(end_date);
      }

      if (entry_type) {
        query += ' AND entry_type = ?';
        params.push(entry_type);
      }

      query += ' ORDER BY entry_date DESC';

      const entries = await this.db.query(query, params);

      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const {
        patient_id,
        entry_date,
        entry_type,
        symptom_name,
        severity,
        measurement_value,
        measurement_unit,
        notes,
        triggers,
        mood_rating,
        activity_level,
      } = req.body;

      if (!patient_id || !entry_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO patient_diary (
          id, patient_id, organization_id, entry_date, entry_type,
          symptom_name, severity, measurement_value, measurement_unit,
          notes, triggers, mood_rating, activity_level, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          patient_id,
          organizationId,
          entry_date || now,
          entry_type,
          symptom_name,
          severity,
          measurement_value,
          measurement_unit,
          notes,
          JSON.stringify(triggers || []),
          mood_rating,
          activity_level,
          now,
        ]
      );

      const entry = await this.db.get('SELECT * FROM patient_diary WHERE id = ?', [id]);

      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const { organizationId } = req.user!;
      const { days = '30' } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));

      const entries = await this.db.query(
        `SELECT * FROM patient_diary 
         WHERE patient_id = ? AND organization_id = ? AND entry_date >= ?
         ORDER BY entry_date ASC`,
        [patientId, organizationId, startDate.toISOString()]
      );

      // Calculate stats
      const stats = {
        total_entries: entries.length,
        symptom_entries: entries.filter((e: any) => e.entry_type === 'symptom').length,
        avg_severity: 0,
        avg_mood: 0,
        common_triggers: [] as string[],
        symptom_trends: {} as any,
      };

      const severities = entries.filter((e: any) => e.severity).map((e: any) => e.severity);
      const moods = entries.filter((e: any) => e.mood_rating).map((e: any) => e.mood_rating);

      if (severities.length > 0) {
        stats.avg_severity = severities.reduce((a: number, b: number) => a + b, 0) / severities.length;
      }

      if (moods.length > 0) {
        stats.avg_mood = moods.reduce((a: number, b: number) => a + b, 0) / moods.length;
      }

      res.json({ entries, stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const diaryController = new DiaryController();
