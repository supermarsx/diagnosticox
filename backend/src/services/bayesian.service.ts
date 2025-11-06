import { BayesianCalculation } from '../types';

export class BayesianService {
  /**
   * Calculate post-test probability using Bayesian inference
   * @param pretestProbability - Probability before test (0-1)
   * @param likelihoodRatio - LR+ for positive test, LR- for negative test
   * @returns Bayesian calculation results
   */
  calculatePostTestProbability(
    pretestProbability: number,
    likelihoodRatio: number
  ): BayesianCalculation {
    // Validate inputs
    if (pretestProbability < 0 || pretestProbability > 1) {
      throw new Error('Pretest probability must be between 0 and 1');
    }
    if (likelihoodRatio < 0) {
      throw new Error('Likelihood ratio must be positive');
    }

    // Convert probability to odds
    const pretestOdds = pretestProbability / (1 - pretestProbability);
    
    // Calculate post-test odds
    const posttestOdds = pretestOdds * likelihoodRatio;
    
    // Convert odds back to probability
    const posttestProbability = posttestOdds / (1 + posttestOdds);

    return {
      pretest_probability: pretestProbability,
      likelihood_ratio: likelihoodRatio,
      posttest_probability: posttestProbability,
      pretest_odds: pretestOdds,
      posttest_odds: posttestOdds,
    };
  }

  /**
   * Calculate both positive and negative post-test probabilities
   */
  calculateBothOutcomes(
    pretestProbability: number,
    lrPositive: number,
    lrNegative: number
  ): {
    if_positive: BayesianCalculation;
    if_negative: BayesianCalculation;
  } {
    return {
      if_positive: this.calculatePostTestProbability(pretestProbability, lrPositive),
      if_negative: this.calculatePostTestProbability(pretestProbability, lrNegative),
    };
  }

  /**
   * Calculate likelihood ratios from sensitivity and specificity
   */
  calculateLikelihoodRatios(
    sensitivity: number,
    specificity: number
  ): { lrPositive: number; lrNegative: number } {
    const lrPositive = sensitivity / (1 - specificity);
    const lrNegative = (1 - sensitivity) / specificity;

    return { lrPositive, lrNegative };
  }

  /**
   * Suggest pretest probability based on clinical context
   */
  suggestPretestProbability(
    clinicalContext: {
      age?: number;
      gender?: string;
      riskFactors?: string[];
      symptoms?: string[];
    }
  ): number {
    // This would typically use clinical decision rules or epidemiological data
    // For now, return a moderate pretest probability
    // In a real system, this would query a knowledge base
    return 0.15; // 15% default pretest probability
  }

  /**
   * Generate test planning rationale
   */
  generateTestRationale(
    hypothesisName: string,
    testName: string,
    pretestProb: number,
    posttestIfPositive: number,
    posttestIfNegative: number
  ): string {
    const pretestPercent = (pretestProb * 100).toFixed(1);
    const posPositivePercent = (posttestIfPositive * 100).toFixed(1);
    const posNegativePercent = (posttestIfNegative * 100).toFixed(1);

    return `Testing for ${hypothesisName} with ${testName}:
- Current probability: ${pretestPercent}%
- If positive: increases to ${posPositivePercent}%
- If negative: decreases to ${posNegativePercent}%

Clinical significance: ${this.interpretProbabilityChange(pretestProb, posttestIfPositive, posttestIfNegative)}`;
  }

  private interpretProbabilityChange(
    pretest: number,
    posttestPos: number,
    posttestNeg: number
  ): string {
    const deltaPos = posttestPos - pretest;
    const deltaNeg = pretest - posttestNeg;

    if (deltaPos > 0.3 || deltaNeg > 0.3) {
      return 'High diagnostic value - significantly changes probability';
    } else if (deltaPos > 0.1 || deltaNeg > 0.1) {
      return 'Moderate diagnostic value - may help narrow differential';
    } else {
      return 'Low diagnostic value - consider alternative tests';
    }
  }

  /**
   * Recommend testing tier based on probability thresholds
   */
  recommendTestingTier(currentProbability: number): {
    tier: number;
    rationale: string;
  } {
    if (currentProbability < 0.1) {
      return {
        tier: 1,
        rationale: 'Low probability - start with high-sensitivity screening tests',
      };
    } else if (currentProbability < 0.5) {
      return {
        tier: 2,
        rationale: 'Moderate probability - use confirmatory tests with good LR+',
      };
    } else {
      return {
        tier: 3,
        rationale: 'High probability - consider definitive diagnostic procedures',
      };
    }
  }
}

export const bayesianService = new BayesianService();
