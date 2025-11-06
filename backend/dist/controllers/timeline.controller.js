"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineController = exports.TimelineController = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class TimelineController {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    async listForPatient(req, res) {
        try {
            const { patientId } = req.params;
            const { organizationId } = req.user;
            const events = await this.db.query(`SELECT * FROM timeline_events 
         WHERE patient_id = ? AND organization_id = ? 
         ORDER BY event_date DESC`, [patientId, organizationId]);
            res.json(events);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const { organizationId, userId } = req.user;
            const { patient_id, problem_id, event_type, event_date, event_name, description, clinical_significance, related_facts, } = req.body;
            if (!patient_id || !event_type || !event_name) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            await this.db.execute(`INSERT INTO timeline_events (
          id, patient_id, organization_id, problem_id, event_type,
          event_date, event_name, description, clinical_significance,
          related_facts, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
            ]);
            const event = await this.db.get('SELECT * FROM timeline_events WHERE id = ?', [id]);
            res.status(201).json(event);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.TimelineController = TimelineController;
exports.timelineController = new TimelineController();
