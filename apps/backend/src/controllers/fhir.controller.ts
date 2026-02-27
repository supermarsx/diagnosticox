import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

export class FhirController {
  private db = getDatabase();

  async getObservations(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      await ensurePatientAccessible(patientId, organizationId);

      const facts = await this.db.query(
        'SELECT * FROM facts WHERE patient_id = ? AND organization_id = ? ORDER BY measured_at DESC',
        [patientId, organizationId]
      );

      const observations = facts.map((fact: any) => this.factToObservation(fact, organizationId));
      res.json({ resourceType: 'Bundle', type: 'searchset', entry: observations.map((o) => ({ resource: o })) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getConditions(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      await ensurePatientAccessible(patientId, organizationId);

      const problems = await this.db.query(
        'SELECT * FROM problems WHERE patient_id = ? AND organization_id = ? ORDER BY created_at DESC',
        [patientId, organizationId]
      );

      const conditions = problems.map((p: any) => this.problemToCondition(p, organizationId));
      res.json({ resourceType: 'Bundle', type: 'searchset', entry: conditions.map((c) => ({ resource: c })) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createObservation(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const obs = req.body;

      if (!obs?.resourceType || obs.resourceType !== 'Observation') {
        return res.status(400).json({ error: 'Invalid Observation resource' });
      }

      const patientRef = obs.subject?.reference;
      if (!patientRef || !patientRef.startsWith('Patient/')) {
        return res.status(400).json({ error: 'Observation.subject.reference must be Patient/{id}' });
      }
      const patientId = patientRef.split('/')[1];
      await ensurePatientAccessible(patientId, organizationId);

      const measurementName =
        obs.code?.text ||
        obs.code?.coding?.[0]?.display ||
        obs.code?.coding?.[0]?.code ||
        'Observation';
      const measurementValue = obs.valueQuantity?.value ?? null;
      const measurementUnit = obs.valueQuantity?.unit ?? null;
      const valueText = obs.valueString || obs.valueCodeableConcept?.text || null;
      const measuredAt = obs.effectiveDateTime || new Date().toISOString();

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO facts (
          id, patient_id, organization_id, fact_type, measurement_name,
          measurement_value, measurement_unit, value_text, measured_at,
          source, recorded_by, context, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          patientId,
          organizationId,
          obs.category?.[0]?.coding?.[0]?.code || 'lab',
          measurementName,
          measurementValue,
          measurementUnit,
          valueText,
          measuredAt,
          'fhir',
          userId,
          JSON.stringify(obs.component || []),
          now,
        ]
      );

      const storedFact = await this.db.get('SELECT * FROM facts WHERE id = ?', [id]);
      const observation = this.factToObservation(storedFact, organizationId);

      await writeAuditLog({
        organizationId,
        userId,
        patientId,
        table: 'facts',
        recordId: id,
        action: 'create',
        changes: { measurementName, measurementValue, measurementUnit },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json(observation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDiagnosticReports(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      await ensurePatientAccessible(patientId, organizationId);

      const testRows = await this.db.query(
        `SELECT to1.*, tr.result_value, tr.result_interpretation, tr.resulted_at
         FROM test_orders to1
         LEFT JOIN test_results tr ON tr.test_order_id = to1.id
         WHERE to1.patient_id = ? AND to1.organization_id = ?
         ORDER BY to1.ordered_at DESC`,
        [patientId, organizationId]
      );

      const reports = testRows.map((row: any) => ({
        resourceType: 'DiagnosticReport',
        id: row.id,
        status: row.status === 'completed' ? 'final' : 'preliminary',
        code: {
          text: row.test_name,
        },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: row.resulted_at || row.ordered_at,
        issued: row.resulted_at || row.ordered_at,
        conclusion: row.result_interpretation || undefined,
        presentedForm: row.result_value
          ? [{ contentType: 'text/plain', data: Buffer.from(String(row.result_value)).toString('base64') }]
          : undefined,
      }));

      res.json({ resourceType: 'Bundle', type: 'searchset', entry: reports.map((r: any) => ({ resource: r })) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMedicationStatements(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      await ensurePatientAccessible(patientId, organizationId);

      const trials = await this.db.query(
        `SELECT * FROM treatment_trials
         WHERE patient_id = ? AND organization_id = ?
         ORDER BY start_date DESC`,
        [patientId, organizationId]
      );

      const meds = trials.map((trial: any) => ({
        resourceType: 'MedicationStatement',
        id: trial.id,
        status: trial.status === 'completed' ? 'completed' : 'active',
        medicationCodeableConcept: {
          text: trial.intervention,
        },
        subject: { reference: `Patient/${patientId}` },
        effectivePeriod: {
          start: trial.start_date,
          end: trial.actual_end_date || trial.planned_end_date || undefined,
        },
        dosage: trial.dose_schedule ? [{ text: trial.dose_schedule }] : undefined,
        note: trial.clinical_notes ? [{ text: trial.clinical_notes }] : undefined,
      }));

      res.json({ resourceType: 'Bundle', type: 'searchset', entry: meds.map((m: any) => ({ resource: m })) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCondition(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const condition = req.body;

      if (!condition?.resourceType || condition.resourceType !== 'Condition') {
        return res.status(400).json({ error: 'Invalid Condition resource' });
      }

      const patientRef = condition.subject?.reference;
      if (!patientRef || !patientRef.startsWith('Patient/')) {
        return res.status(400).json({ error: 'Condition.subject.reference must be Patient/{id}' });
      }
      const patientId = patientRef.split('/')[1];
      await ensurePatientAccessible(patientId, organizationId);

      const id = uuidv4();
      const now = new Date().toISOString();
      const problemName = condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition';
      const problemType = condition.category?.[0]?.coding?.[0]?.code || 'problem-list-item';
      const status = condition.clinicalStatus?.coding?.[0]?.code || 'active';

      await this.db.execute(
        `INSERT INTO problems (
          id, patient_id, organization_id, problem_name, problem_type,
          onset_date, status, priority, clinical_context, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          patientId,
          organizationId,
          problemName,
          problemType,
          condition.onsetDateTime || null,
          status,
          0,
          condition.note?.[0]?.text || null,
          userId,
          now,
          now,
        ]
      );

      const created = await this.db.get('SELECT * FROM problems WHERE id = ?', [id]);
      res.status(201).json(this.problemToCondition(created, organizationId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private factToObservation(fact: any, organizationId: string) {
    return {
      resourceType: 'Observation',
      id: fact.id,
      status: 'final',
      category: [{ coding: [{ code: fact.fact_type || 'history', display: fact.fact_type || 'history' }] }],
      code: {
        coding: [{ code: fact.measurement_name, display: fact.measurement_name }],
        text: fact.measurement_name,
      },
      subject: { reference: `Patient/${fact.patient_id}` },
      effectiveDateTime: fact.measured_at,
      valueQuantity:
        fact.measurement_value !== null
          ? { value: fact.measurement_value, unit: fact.measurement_unit || undefined }
          : undefined,
      valueString: fact.measurement_value === null ? fact.value_text : undefined,
      performer: [{ reference: `Organization/${organizationId}` }],
      extension: fact.context ? [{ url: 'http://diagnosticox/context', valueString: fact.context }] : undefined,
    };
  }

  private problemToCondition(problem: any, organizationId: string) {
    return {
      resourceType: 'Condition',
      id: problem.id,
      clinicalStatus: { coding: [{ code: problem.status || 'active' }] },
      category: [{ coding: [{ code: problem.problem_type || 'problem-list-item' }] }],
      code: { text: problem.problem_name },
      subject: { reference: `Patient/${problem.patient_id}` },
      onsetDateTime: problem.onset_date || problem.created_at,
      recorder: { reference: `Organization/${organizationId}` },
    };
  }
}

export const fhirController = new FhirController();
