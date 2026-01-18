import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { bayesianService } from '../services/bayesian.service';
import { getDatabase } from '../config/database';
import { writeAuditLog } from '../utils/audit';

export class BayesianController {
  async calculate(req: AuthRequest, res: Response) {
    try {
      const { pretest_probability, likelihood_ratio } = req.body;

      if (
        pretest_probability === undefined ||
        likelihood_ratio === undefined
      ) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const result = bayesianService.calculatePostTestProbability(
        parseFloat(pretest_probability),
        parseFloat(likelihood_ratio)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async calculateBoth(req: AuthRequest, res: Response) {
    try {
      const { pretest_probability, lr_positive, lr_negative } = req.body;

      if (
        pretest_probability === undefined ||
        lr_positive === undefined ||
        lr_negative === undefined
      ) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const result = bayesianService.calculateBothOutcomes(
        parseFloat(pretest_probability),
        parseFloat(lr_positive),
        parseFloat(lr_negative)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async calculateFromSensSpec(req: AuthRequest, res: Response) {
    try {
      const { sensitivity, specificity, pretest_probability } = req.body;

      if (
        sensitivity === undefined ||
        specificity === undefined ||
        pretest_probability === undefined
      ) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const { lrPositive, lrNegative } = bayesianService.calculateLikelihoodRatios(
        parseFloat(sensitivity),
        parseFloat(specificity)
      );

      const result = bayesianService.calculateBothOutcomes(
        parseFloat(pretest_probability),
        lrPositive,
        lrNegative
      );

      res.json({
        likelihood_ratios: { lr_positive: lrPositive, lr_negative: lrNegative },
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async recommendTier(req: AuthRequest, res: Response) {
    try {
      const { current_probability } = req.body;

      if (current_probability === undefined) {
        return res.status(400).json({ error: 'Missing current_probability' });
      }

      const result = bayesianService.recommendTestingTier(
        parseFloat(current_probability)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async batchUpdateHypotheses(req: AuthRequest, res: Response) {
    try {
      const { problemId } = req.params;
      const { calculations } = req.body; // Array of { hypothesis_id, current_probability, clinical_reasoning }
      const organizationId = req.tenantId || req.user!.organizationId;
      const db = getDatabase();

      if (!Array.isArray(calculations)) {
        return res.status(400).json({ error: 'calculations must be an array' });
      }

      for (const calc of calculations) {
        await db.execute(
          `UPDATE hypotheses 
           SET current_probability = ?, clinical_reasoning = COALESCE(?, clinical_reasoning), updated_at = ?
           WHERE id = ? AND problem_id = ? AND organization_id = ?`,
          [
            calc.current_probability,
            calc.clinical_reasoning || null,
            new Date().toISOString(),
            calc.hypothesis_id,
            problemId,
            organizationId,
          ]
        );
      }

      await writeAuditLog({
        organizationId,
        userId: req.user?.userId,
        table: 'hypotheses',
        action: 'batch_update',
        recordId: problemId,
        changes: { updated_count: calculations.length },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.json({ success: true, updated: calculations.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const bayesianController = new BayesianController();
