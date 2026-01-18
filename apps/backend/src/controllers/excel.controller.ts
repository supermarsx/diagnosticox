import { Response } from 'express';
import ExcelJS from 'exceljs';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';

export class ExcelController {
  private db = getDatabase();

  async exportPatientWorkbook(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      await ensurePatientAccessible(patientId, organizationId);

      const patient = await this.db.get('SELECT * FROM patients WHERE id = ? AND organization_id = ?', [patientId, organizationId]);
      const problems = await this.db.query('SELECT * FROM problems WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);
      const facts = await this.db.query('SELECT * FROM facts WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);
      const timeline = await this.db.query('SELECT * FROM timeline_events WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);
      const trials = await this.db.query('SELECT * FROM treatment_trials WHERE patient_id = ? AND organization_id = ?', [patientId, organizationId]);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'DiagnosticoX';
      workbook.created = new Date();

      // Patients Sheet
      const patientSheet = workbook.addWorksheet('Patient');
      if (patient) {
        patientSheet.columns = Object.keys(patient).map(key => ({ header: key, key }));
        patientSheet.addRow(patient);
      }

      // Problems Sheet
      const problemsSheet = workbook.addWorksheet('Problems');
      if (problems.length) {
        problemsSheet.columns = Object.keys(problems[0]).map(key => ({ header: key, key }));
        problemsSheet.addRows(problems);
      }

      // Facts Sheet
      const factsSheet = workbook.addWorksheet('Facts');
      if (facts.length) {
        factsSheet.columns = Object.keys(facts[0]).map(key => ({ header: key, key }));
        factsSheet.addRows(facts);
      }

      // Timeline Sheet
      const timelineSheet = workbook.addWorksheet('Timeline');
      if (timeline.length) {
        timelineSheet.columns = Object.keys(timeline[0]).map(key => ({ header: key, key }));
        timelineSheet.addRows(timeline);
      }

      // Trials Sheet
      const trialsSheet = workbook.addWorksheet('Trials');
      if (trials.length) {
        trialsSheet.columns = Object.keys(trials[0]).map(key => ({ header: key, key }));
        trialsSheet.addRows(trials);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="patient_${patientId}_export.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const excelController = new ExcelController();
