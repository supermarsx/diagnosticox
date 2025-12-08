import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

export class BiasController {
  private db = getDatabase();

  async listForPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      await ensurePatientAccessible(patientId, organizationId);

      const guardrails = await this.db.query(
        `SELECT * FROM bias_guardrails 
         WHERE patient_id = ? AND organization_id = ?
         ORDER BY created_at DESC`,
        [patientId, organizationId]
      );

      res.json({ guardrails });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const {
        patient_id,
        problem_id,
        guardrail_type,
        checkpoint_question,
        precommit_prediction,
        alternative_hypotheses,
        disconfirming_evidence,
        checkpoint_passed,
        effect_on_ranks,
        notes,
      } = req.body;

      if (!patient_id || !problem_id || !guardrail_type || !checkpoint_question) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await ensurePatientAccessible(patient_id, organizationId);

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO bias_guardrails (
          id, patient_id, organization_id, problem_id, guardrail_type,
          checkpoint_question, precommit_prediction, alternative_hypotheses,
          disconfirming_evidence, checkpoint_passed, effect_on_ranks, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          patient_id,
          organizationId,
          problem_id,
          guardrail_type,
          checkpoint_question,
          precommit_prediction || null,
          JSON.stringify(alternative_hypotheses || []),
          JSON.stringify(disconfirming_evidence || []),
          checkpoint_passed ? 1 : 0,
          effect_on_ranks || null,
          notes || null,
          now,
        ]
      );

      const guardrail = await this.db.get('SELECT * FROM bias_guardrails WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        patientId: patient_id,
        table: 'bias_guardrails',
        recordId: id,
        action: 'create',
        changes: { guardrail_type, checkpoint_question, checkpoint_passed },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ guardrail });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const biasController = new BiasController();
