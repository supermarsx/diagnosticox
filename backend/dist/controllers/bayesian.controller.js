"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bayesianController = exports.BayesianController = void 0;
const bayesian_service_1 = require("../services/bayesian.service");
class BayesianController {
    async calculate(req, res) {
        try {
            const { pretest_probability, likelihood_ratio } = req.body;
            if (pretest_probability === undefined ||
                likelihood_ratio === undefined) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            const result = bayesian_service_1.bayesianService.calculatePostTestProbability(parseFloat(pretest_probability), parseFloat(likelihood_ratio));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async calculateBoth(req, res) {
        try {
            const { pretest_probability, lr_positive, lr_negative } = req.body;
            if (pretest_probability === undefined ||
                lr_positive === undefined ||
                lr_negative === undefined) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            const result = bayesian_service_1.bayesianService.calculateBothOutcomes(parseFloat(pretest_probability), parseFloat(lr_positive), parseFloat(lr_negative));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async calculateFromSensSpec(req, res) {
        try {
            const { sensitivity, specificity, pretest_probability } = req.body;
            if (sensitivity === undefined ||
                specificity === undefined ||
                pretest_probability === undefined) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            const { lrPositive, lrNegative } = bayesian_service_1.bayesianService.calculateLikelihoodRatios(parseFloat(sensitivity), parseFloat(specificity));
            const result = bayesian_service_1.bayesianService.calculateBothOutcomes(parseFloat(pretest_probability), lrPositive, lrNegative);
            res.json({
                likelihood_ratios: { lr_positive: lrPositive, lr_negative: lrNegative },
                ...result,
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async recommendTier(req, res) {
        try {
            const { current_probability } = req.body;
            if (current_probability === undefined) {
                return res.status(400).json({ error: 'Missing current_probability' });
            }
            const result = bayesian_service_1.bayesianService.recommendTestingTier(parseFloat(current_probability));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.BayesianController = BayesianController;
exports.bayesianController = new BayesianController();
