"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.problemController = exports.ProblemController = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class ProblemController {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    async listForPatient(req, res) {
        try {
            const { patientId } = req.params;
            const { organizationId } = req.user;
            const problems = await this.db.query(`SELECT * FROM problems 
         WHERE patient_id = ? AND organization_id = ? 
         ORDER BY priority DESC, created_at DESC`, [patientId, organizationId]);
            res.json(problems);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async get(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const problem = await this.db.get('SELECT * FROM problems WHERE id = ? AND organization_id = ?', [id, organizationId]);
            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }
            // Get associated hypotheses
            const hypotheses = await this.db.query(`SELECT * FROM hypotheses 
         WHERE problem_id = ? 
         ORDER BY rank ASC, current_probability DESC`, [id]);
            res.json({ ...problem, hypotheses });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const { organizationId, userId } = req.user;
            const { patient_id, problem_name, problem_type, onset_date, clinical_context, encounter_id, } = req.body;
            if (!patient_id || !problem_name) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            await this.db.execute(`INSERT INTO problems (
          id, patient_id, organization_id, encounter_id, problem_name,
          problem_type, onset_date, clinical_context, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
            ]);
            const problem = await this.db.get('SELECT * FROM problems WHERE id = ?', [id]);
            res.status(201).json(problem);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const existing = await this.db.get('SELECT id FROM problems WHERE id = ? AND organization_id = ?', [id, organizationId]);
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
            const fields = [];
            const values = [];
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
            await this.db.execute(`UPDATE problems SET ${fields.join(', ')} WHERE id = ?`, values);
            const problem = await this.db.get('SELECT * FROM problems WHERE id = ?', [id]);
            res.json(problem);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.ProblemController = ProblemController;
exports.problemController = new ProblemController();
