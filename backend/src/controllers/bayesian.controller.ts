import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { bayesianService } from '../services/bayesian.service';

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
}

export const bayesianController = new BayesianController();
