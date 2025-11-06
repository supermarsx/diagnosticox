"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diaryController = exports.DiaryController = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class DiaryController {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    async listForPatient(req, res) {
        try {
            const { patientId } = req.params;
            const { organizationId } = req.user;
            const { start_date, end_date, entry_type } = req.query;
            let query = `SELECT * FROM patient_diary WHERE patient_id = ? AND organization_id = ?`;
            const params = [patientId, organizationId];
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
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const { organizationId } = req.user;
            const { patient_id, entry_date, entry_type, symptom_name, severity, measurement_value, measurement_unit, notes, triggers, mood_rating, activity_level, } = req.body;
            if (!patient_id || !entry_type) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            await this.db.execute(`INSERT INTO patient_diary (
          id, patient_id, organization_id, entry_date, entry_type,
          symptom_name, severity, measurement_value, measurement_unit,
          notes, triggers, mood_rating, activity_level, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
            ]);
            const entry = await this.db.get('SELECT * FROM patient_diary WHERE id = ?', [id]);
            res.status(201).json(entry);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getStats(req, res) {
        try {
            const { patientId } = req.params;
            const { organizationId } = req.user;
            const { days = '30' } = req.query;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));
            const entries = await this.db.query(`SELECT * FROM patient_diary 
         WHERE patient_id = ? AND organization_id = ? AND entry_date >= ?
         ORDER BY entry_date ASC`, [patientId, organizationId, startDate.toISOString()]);
            // Calculate stats
            const stats = {
                total_entries: entries.length,
                symptom_entries: entries.filter((e) => e.entry_type === 'symptom').length,
                avg_severity: 0,
                avg_mood: 0,
                common_triggers: [],
                symptom_trends: {},
            };
            const severities = entries.filter((e) => e.severity).map((e) => e.severity);
            const moods = entries.filter((e) => e.mood_rating).map((e) => e.mood_rating);
            if (severities.length > 0) {
                stats.avg_severity = severities.reduce((a, b) => a + b, 0) / severities.length;
            }
            if (moods.length > 0) {
                stats.avg_mood = moods.reduce((a, b) => a + b, 0) / moods.length;
            }
            res.json({ entries, stats });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.DiaryController = DiaryController;
exports.diaryController = new DiaryController();
