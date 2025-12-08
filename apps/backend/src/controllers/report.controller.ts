import { Response } from 'express';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export class ReportController {
  private db = getDatabase();

  async outcomes(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const cohort = req.query.cohort as string | undefined;

      const patients = await this.db.get('SELECT COUNT(*) as count FROM patients WHERE organization_id = ?', [organizationId]);
      const problems = await this.db.get('SELECT COUNT(*) as count FROM problems WHERE organization_id = ?', [organizationId]);
      const trials = await this.db.get('SELECT COUNT(*) as count FROM treatment_trials WHERE organization_id = ?', [organizationId]);
      const facts = await this.db.get('SELECT COUNT(*) as count FROM facts WHERE organization_id = ?', [organizationId]);

      // Placeholder cohort filter (if provided, just echoes)
      res.json({
        cohort: cohort || 'all',
        metrics: {
          patients: patients?.count || 0,
          problems: problems?.count || 0,
          trials: trials?.count || 0,
          observations: facts?.count || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const reportController = new ReportController();
