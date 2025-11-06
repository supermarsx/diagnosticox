"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = exports.PatientController = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class PatientController {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    async list(req, res) {
        try {
            const { organizationId } = req.user;
            const { search, limit = '50', offset = '0' } = req.query;
            let query = 'SELECT * FROM patients WHERE organization_id = ?';
            const params = [organizationId];
            if (search) {
                query += ' AND (first_name LIKE ? OR last_name LIKE ? OR mrn LIKE ?)';
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern, searchPattern);
            }
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));
            const patients = await this.db.query(query, params);
            res.json({ patients, total: patients.length });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async get(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const patient = await this.db.get('SELECT * FROM patients WHERE id = ? AND organization_id = ?', [id, organizationId]);
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json(patient);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const { organizationId } = req.user;
            const { mrn, first_name, last_name, date_of_birth, gender, contact_phone, contact_email, emergency_contact, insurance_info, } = req.body;
            if (!first_name || !last_name || !date_of_birth) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            await this.db.execute(`INSERT INTO patients (
          id, organization_id, mrn, first_name, last_name, date_of_birth,
          gender, contact_phone, contact_email, emergency_contact, insurance_info,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
            ]);
            const patient = await this.db.get('SELECT * FROM patients WHERE id = ?', [id]);
            res.status(201).json(patient);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const existing = await this.db.get('SELECT id FROM patients WHERE id = ? AND organization_id = ?', [id, organizationId]);
            if (!existing) {
                return res.status(404).json({ error: 'Patient not found' });
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
            const fields = [];
            const values = [];
            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key)) {
                    fields.push(`${key} = ?`);
                    if (key === 'emergency_contact' || key === 'insurance_info') {
                        values.push(JSON.stringify(value));
                    }
                    else {
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
            await this.db.execute(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, values);
            const patient = await this.db.get('SELECT * FROM patients WHERE id = ?', [id]);
            res.json(patient);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;
            const existing = await this.db.get('SELECT id FROM patients WHERE id = ? AND organization_id = ?', [id, organizationId]);
            if (!existing) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            await this.db.execute('DELETE FROM patients WHERE id = ?', [id]);
            res.json({ message: 'Patient deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.PatientController = PatientController;
exports.patientController = new PatientController();
