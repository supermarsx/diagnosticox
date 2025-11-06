"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treatmentTrialController = exports.TreatmentTrialController = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class TreatmentTrialController {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    async listForPatient(req, res) {
        try {
            const { patientId } = req.params;
            const { organizationId } = req.user;
            const trials = await this.db.query(`SELECT * FROM treatment_trials 
         WHERE patient_id = ? AND organization_id = ? 
         ORDER BY start_date DESC`, [patientId, organizationId]);
            res.json(trials);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async get(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const trial = await this.db.get('SELECT * FROM treatment_trials WHERE id = ? AND organization_id = ?', [id, organizationId]);
            if (!trial) {
                return res.status(404).json({ error: 'Trial not found' });
            }
            // Get trial metrics
            const metrics = await this.db.query(`SELECT * FROM trial_metrics 
         WHERE trial_id = ? 
         ORDER BY measured_at ASC`, [id]);
            res.json({ ...trial, metrics });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const { organizationId, userId } = req.user;
            const { patient_id, problem_id, hypothesis_id, trial_name, intervention, intervention_type, dose_schedule, start_date, planned_end_date, target_metrics, success_criteria, stop_rules, side_effects_to_monitor, pretreatment_baseline, } = req.body;
            if (!patient_id || !problem_id || !trial_name || !intervention) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            await this.db.execute(`INSERT INTO treatment_trials (
          id, patient_id, organization_id, problem_id, hypothesis_id,
          trial_name, intervention, intervention_type, dose_schedule,
          start_date, planned_end_date, status, pretreatment_baseline,
          target_metrics, success_criteria, stop_rules, side_effects_to_monitor,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                patient_id,
                organizationId,
                problem_id,
                hypothesis_id,
                trial_name,
                intervention,
                intervention_type || 'medication',
                dose_schedule,
                start_date || now,
                planned_end_date,
                'active',
                JSON.stringify(pretreatment_baseline || {}),
                JSON.stringify(target_metrics || []),
                success_criteria,
                stop_rules,
                JSON.stringify(side_effects_to_monitor || []),
                userId,
                now,
                now,
            ]);
            const trial = await this.db.get('SELECT * FROM treatment_trials WHERE id = ?', [id]);
            res.status(201).json(trial);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const existing = await this.db.get('SELECT id FROM treatment_trials WHERE id = ? AND organization_id = ?', [id, organizationId]);
            if (!existing) {
                return res.status(404).json({ error: 'Trial not found' });
            }
            const updates = req.body;
            const allowedFields = [
                'status',
                'actual_end_date',
                'stop_reason',
                'decision_point_reached',
                'decision_outcome',
                'clinical_notes',
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
            await this.db.execute(`UPDATE treatment_trials SET ${fields.join(', ')} WHERE id = ?`, values);
            const trial = await this.db.get('SELECT * FROM treatment_trials WHERE id = ?', [id]);
            res.json(trial);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async addMetric(req, res) {
        try {
            const { trialId } = req.params;
            const { organizationId } = req.user;
            // Verify trial exists
            const trial = await this.db.get('SELECT id FROM treatment_trials WHERE id = ? AND organization_id = ?', [trialId, organizationId]);
            if (!trial) {
                return res.status(404).json({ error: 'Trial not found' });
            }
            const { metric_name, metric_value, metric_unit, measured_at, source, notes } = req.body;
            if (!metric_name || metric_value === undefined) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            await this.db.execute(`INSERT INTO trial_metrics (
          id, trial_id, organization_id, metric_name, metric_value,
          metric_unit, measured_at, source, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                trialId,
                organizationId,
                metric_name,
                metric_value,
                metric_unit,
                measured_at || now,
                source || 'clinical_measurement',
                notes,
                now,
            ]);
            const metric = await this.db.get('SELECT * FROM trial_metrics WHERE id = ?', [id]);
            res.status(201).json(metric);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.TreatmentTrialController = TreatmentTrialController;
exports.treatmentTrialController = new TreatmentTrialController();
