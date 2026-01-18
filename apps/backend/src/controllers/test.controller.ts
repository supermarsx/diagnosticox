import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

export class TestController {
  private db = getDatabase();

  async listForProblem(req: AuthRequest, res: Response) {
    try {
      const { problemId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;

      const tests = await this.db.query(
        `SELECT to.*, tr.result_value, tr.result_interpretation, tr.actual_posttest_probability, tr.resulted_at
         FROM test_orders to
         LEFT JOIN test_results tr ON to.id = tr.test_order_id
         WHERE to.problem_id = ? AND to.organization_id = ?
         ORDER BY to.ordered_at DESC`,
        [problemId, organizationId]
      );

      res.json({ tests });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const {
        patient_id,
        problem_id,
        hypothesis_id,
        pivot_id,
        test_name,
        test_type,
        tier,
        pretest_probability,
        expected_posttest_if_positive,
        expected_posttest_if_negative,
        clinical_rationale,
      } = req.body;

      if (!patient_id || !problem_id || !hypothesis_id || !test_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await ensurePatientAccessible(patient_id, organizationId);

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO test_orders (
          id, patient_id, organization_id, problem_id, hypothesis_id,
          pivot_id, test_name, test_type, tier, pretest_probability,
          expected_posttest_if_positive, expected_posttest_if_negative,
          clinical_rationale, ordered_by, ordered_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ordered')`,
        [
          id,
          patient_id,
          organizationId,
          problem_id,
          hypothesis_id,
          pivot_id || null,
          test_name,
          test_type || null,
          tier || 1,
          pretest_probability ?? null,
          expected_posttest_if_positive ?? null,
          expected_posttest_if_negative ?? null,
          clinical_rationale || null,
          userId,
          now,
        ]
      );

      const order = await this.db.get('SELECT * FROM test_orders WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        patientId: patient_id,
        table: 'test_orders',
        recordId: id,
        action: 'create',
        changes: { test_name, tier },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ order });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async recordResult(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const {
        result_value,
        result_interpretation,
        numeric_value,
        reference_range,
        actual_posttest_probability,
        clinical_interpretation,
        resulted_at,
      } = req.body;

      if (!result_value) {
        return res.status(400).json({ error: 'result_value is required' });
      }

      const order = await this.db.get(
        'SELECT * FROM test_orders WHERE id = ? AND organization_id = ?',
        [orderId, organizationId]
      );

      if (!order) {
        return res.status(404).json({ error: 'Test order not found' });
      }

      const id = uuidv4();
      const now = resulted_at || new Date().toISOString();

      await this.db.execute(
        `INSERT INTO test_results (
          id, test_order_id, organization_id, result_value,
          result_interpretation, numeric_value, reference_range,
          actual_posttest_probability, clinical_interpretation,
          resulted_by, resulted_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          orderId,
          organizationId,
          result_value,
          result_interpretation || null,
          numeric_value ?? null,
          reference_range || null,
          actual_posttest_probability ?? null,
          clinical_interpretation || null,
          userId,
          now,
          new Date().toISOString(),
        ]
      );

      // Update order status
      await this.db.execute(
        "UPDATE test_orders SET status = 'completed', result_received_at = ? WHERE id = ?",
        [now, orderId]
      );

      const result = await this.db.get('SELECT * FROM test_results WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        patientId: order.patient_id,
        table: 'test_results',
        recordId: id,
        action: 'create',
        changes: { result_value },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const testController = new TestController();
